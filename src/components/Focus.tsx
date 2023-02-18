import Button from "@ds/Button";
import {
  closestCenter,
  CollisionDetector,
  createDroppable,
  createSortable,
  DragDropProvider,
  DragDropSensors,
  DragEvent,
  Draggable,
  DragOverlay,
  Droppable,
  Id,
  SortableProvider,
} from "@thisbeyond/solid-dnd";
import {
  batch,
  ComponentProps,
  createContext,
  createSignal,
  For,
  JSX,
  JSXElement,
  onCleanup,
  onMount,
  Show,
  splitProps,
  useContext,
} from "solid-js";
import { createLocalStore } from "src/utils/createLocalStore";

declare module "solid-js" {
  namespace JSX {
    interface Directives {
      draggable: boolean;
      droppable: boolean;
      sortable: boolean;
    }
  }
}

export default function App() {
  return (
    <StoreProvider>
      <BoardView />
      <SessionView />
      <SummaryView />
    </StoreProvider>
  );
}

type Task = {
  id: number;
  title: string;
  minutes: number;
  done?: boolean;
};

type LocalStore = {
  session: Array<number>;
  backlog: Array<number>;
  tasks: Record<number, Task>;
  activeSession: {
    start: number;
    end?: number;
    status: "running" | "paused" | "finished";
  } | null;
};

let makeStoreContext = () => {
  let [store, setStore] = createLocalStore<LocalStore>("focus:store", {
    session: [],
    backlog: [1],
    tasks: {
      1: { id: 1, minutes: 20, title: "Fill your backlog with tasks!" },
    },
    activeSession: null,
  });

  return [
    store,
    {
      setStore,
      addTask() {
        batch(() => {
          let id = Date.now();
          setStore("tasks", id, { id, title: "", minutes: 20 });
          setStore("backlog", (ids) => [...ids, id]);
        });
        setTimeout(() => {
          let inputs = document.getElementsByTagName("input");
          inputs[inputs.length - 1].focus();
        });
      },
      removeTask(id: number) {
        function removeIndex(ids: Array<number>, index: number) {
          return [...ids.slice(0, index), ...ids.slice(index + 1)];
        }
        batch(() => {
          let index = store.backlog.indexOf(id);
          if (index >= 0) {
            setStore("backlog", (ids) => removeIndex(ids, index));
          } else {
            index = store.session.indexOf(id);
            setStore("session", (ids) => removeIndex(ids, index));
          }
          setStore("tasks", (tasks) => {
            delete tasks[id];
            return tasks;
          });
        });
      },
      modifyTask(id: number, prop: keyof Task, value: any) {
        setStore("tasks", id, prop, value);
      },
      switchTask(id: number) {
        batch(() => {
          let isBacklog = store.backlog.includes(id);
          setStore(isBacklog ? "backlog" : "session", (tasks) =>
            tasks.filter((taskId) => taskId !== id)
          );
          setStore(isBacklog ? "session" : "backlog", (tasks) => [
            ...tasks,
            id,
          ]);
        });
      },
      startSession() {
        setStore("activeSession", { start: Date.now(), status: "running" });
      },
      endSession() {
        setStore("activeSession", { end: Date.now(), status: "finished" });
      },
      closeSession() {
        setStore((store) => {
          let finishedTasks = store.session
            .map((id) => store.tasks[id])
            .filter((task) => task.done);

          let tasks = { ...store.tasks };
          finishedTasks.forEach((task) => {
            delete tasks[task.id];
          });

          return {
            activeSession: null,
            tasks,
            session: store.session.filter(
              (id) => !finishedTasks.find((task) => task.id === id)
            ),
          };
        });
      },
    },
  ] as const;
};
type StoreContextType = ReturnType<typeof makeStoreContext>;
let StoreContext = createContext<StoreContextType>();
function useStore() {
  let context = useContext(StoreContext);
  if (!context)
    throw new Error("useStore must be used within a StoreProvider!");
  return context;
}

function StoreProvider(props: { children: JSXElement }) {
  return (
    <StoreContext.Provider value={makeStoreContext()}>
      {props.children}
    </StoreContext.Provider>
  );
}

function SummaryView() {
  let [store, actions] = useStore();
  let tasks = () => store.session.map((id) => store.tasks[id]);
  let finishedTasks = () => tasks().filter((task) => task.done);
  let unfinishedTasks = () => tasks().filter((task) => !task.done);
  let userEstimation = () => finishedTasks().reduce((p, c) => p + c.minutes, 0);
  let actualTime = () =>
    Math.floor(
      (store.activeSession!.end! - store.activeSession!.start) / 1000 / 60
    );

  return (
    <Show when={store.activeSession?.status === "finished"}>
      <div class="flex flex-col gap-12 p-4 md:p-8 md:rounded-3xl md:shadow-1 md:bg-[var(--surface-1)]">
        <div>
          <div class="mb-2 text-3xl font-medium">Session finished</div>
          <div class="text-gray-12">
            You have estimated that you need{" "}
            <span class="font-semibold text-blue-a11">
              {userEstimation()} min
            </span>{" "}
            for your tasks and you actually needed{" "}
            <span
              class="font-semibold"
              classList={{
                "text-green-a11": userEstimation() > actualTime(),
                "text-red-a11": userEstimation() + 10 < actualTime(),
              }}
            >
              {actualTime()} min
            </span>
            . {userEstimation() + 10 < actualTime() ? " " : "Good Job!"}
          </div>
        </div>

        <div class="flex justify-between items-center">
          <div>
            <div class="mb-3 text-sm font-extralight text-gray-a11 select-none">
              START
            </div>
            <div class="text-4xl md:text-5xl font-medium">
              {new Date(store.activeSession!.start)
                .toISOString()
                .substring(11, 16)}
            </div>
          </div>
          <div class="flex gap-1 items-center mt-7 text-gray-a11">
            <div>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke-width={1.3}
                stroke="currentColor"
                class="w-6 h-6"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M21 12H3"
                />
              </svg>
            </div>
            <div class="text-sm font-normal">
              {new Date(store.activeSession!.end! - store.activeSession!.start)
                .toISOString()
                .substring(11, 16)}
            </div>
            <div>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke-width={1.3}
                stroke="currentColor"
                class="w-6 h-6"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M17.25 8.25L21 12m0 0l-3.75 3.75M21 12H3"
                />
              </svg>
            </div>
          </div>
          <div>
            <div class="mb-3 text-sm font-extralight text-gray-a11 select-none">
              END
            </div>
            <div class="text-4xl md:text-5xl font-medium">
              {new Date(store.activeSession!.end!)
                .toISOString()
                .substring(11, 16)}
            </div>
          </div>
        </div>

        <Show when={finishedTasks().length !== 0}>
          <div class="flex flex-col gap-2">
            <h2 class="text-sm font-extralight text-gray-a11 select-none">
              COMPLETED
            </h2>
            <For each={finishedTasks()}>
              {(task) => (
                <TaskPanel>
                  <div class="flex items-center gap-3">
                    <CheckMark checked />
                    <div>{task.title}</div>
                  </div>
                  <span
                    aria-label={`Estimated time for task "${task.title}"`}
                    class="text-sm text-right font-extralight bg-transparent select-none"
                  >
                    {task.minutes} m
                  </span>
                </TaskPanel>
              )}
            </For>
          </div>
        </Show>

        <Show when={unfinishedTasks().length !== 0}>
          <div class="flex flex-col gap-2">
            <h2 class="text-sm font-extralight text-gray-a11 select-none">
              NOT COMPLETED
            </h2>
            <For each={unfinishedTasks()}>
              {(task) => (
                <TaskPanel>
                  <div class="flex items-center gap-3">
                    <CheckMark checked={false} />
                    <div>{task.title}</div>
                  </div>
                  <span
                    aria-label={`Estimated time for task "${task.title}"`}
                    class="text-sm text-right font-extralight rounded bg-transparent select-none"
                  >
                    {task.minutes} m
                  </span>
                </TaskPanel>
              )}
            </For>
          </div>
        </Show>

        <div class="flex justify-end">
          <div>
            <Button
              onClick={() => {
                actions.closeSession();
              }}
            >
              Close Session
            </Button>
          </div>
        </div>
      </div>
    </Show>
  );
}

function SessionView() {
  let [store, actions] = useStore();
  let tasks = () => store.session.map((id) => store.tasks[id]);
  let activeTask = () =>
    tasks()
      .filter((task) => !task.done)
      .at(0);
  let unfinishedTasks = () => {
    let filtered = tasks().filter((task) => !task.done);
    return filtered.slice(1, filtered.length);
  };
  let finishedTasks = () => tasks().filter((task) => task.done);

  return (
    <Show when={store.activeSession?.status === "running"}>
      <Counter />
      <div class="flex flex-col gap-12 p-4 md:p-8 md:rounded-3xl md:shadow-1 md:bg-[var(--surface-1)]">
        {/* Active Task */}
        <div>
          <h2 class="mb-3 text-sm font-extralight text-gray-a11 select-none">
            WORKING ON
          </h2>
          <TaskPanel>
            <div class="flex items-center gap-3">
              <CheckMark checked={false} />
              <div>{activeTask()?.title}</div>
            </div>
            <span
              aria-label={`Estimated time for task "${activeTask()!.title}"`}
              class="text-sm text-right font-extralight rounded bg-transparent select-none"
            >
              {activeTask()!.minutes} m
            </span>
          </TaskPanel>
          <div class="mt-4 flex justify-end">
            <Button
              color="blue"
              onClick={() => {
                batch(() => {
                  if (unfinishedTasks().length === 0) {
                    actions.endSession();
                  }

                  actions.modifyTask(
                    activeTask()!.id,
                    "done",
                    !activeTask()!.done
                  );
                });
              }}
            >
              Task Done
            </Button>
          </div>
        </div>

        {/* Unfinished Tasks */}
        <Show when={unfinishedTasks().length !== 0}>
          <div class="flex flex-col gap-2">
            <h2 class="text-sm font-extralight text-gray-a11 select-none">
              STILL TO DO
            </h2>
            <For each={unfinishedTasks()}>
              {(task) => (
                <TaskPanel
                  role="button"
                  class="hover:brightness-95 dark:hover:brightness-110 transition"
                  onClick={() => {
                    actions.setStore("session", [
                      task.id,
                      ...store.session.filter((id) => id !== task.id),
                    ]);
                  }}
                >
                  <div class="flex items-center gap-3">
                    <CheckMark checked={false} />
                    <div>{task.title}</div>
                  </div>
                  <span
                    aria-label={`Estimated time for task "${
                      activeTask()!.title
                    }"`}
                    class="text-sm text-right font-extralight rounded bg-transparent select-none"
                  >
                    {task.minutes} m
                  </span>
                </TaskPanel>
              )}
            </For>
          </div>
        </Show>

        {/* Finished Tasks */}
        <Show when={finishedTasks().length !== 0}>
          <div class="flex flex-col gap-2">
            <h2 class="text-sm font-extralight text-gray-a11 select-none">
              DONE
            </h2>
            <For each={finishedTasks()}>
              {(task) => (
                <div
                  class={`group flex justify-between items-center pl-3 pr-5 h-12 rounded-md shadow-1`}
                >
                  <div class="flex items-center gap-3">
                    <CheckMark checked={true} />
                    <div>{task.title}</div>
                  </div>
                </div>
              )}
            </For>
          </div>
        </Show>
        <div class="flex justify-end">
          <Button onClick={() => actions.endSession()}>End Session</Button>
        </div>
      </div>
    </Show>
  );
}

function Counter() {
  let [store] = useStore();
  let [count, setCount] = createSignal(
    Math.floor(
      (new Date().getTime() - new Date(store.activeSession!.start).getTime()) /
        1000
    )
  );
  let time = () => new Date(count() * 1000).toISOString().substring(11, 19);
  let hide = () =>
    count() > 5 ||
    new Date().getTime() - new Date(store.activeSession!.start).getTime() >
      5 * 1000;

  let timer = setInterval(() => setCount(count() + 1), 1000);
  onCleanup(() => {
    clearInterval(timer);
  });

  return (
    <div
      class="flex justify-center my-6 md:my-12 text-gray-a11 text-7xl font-medium select-none hover:opacity-100 transition-opacity duration-[6s] tabular-nums"
      classList={{
        "opacity-0 touch:opacity-100": hide(),
      }}
    >
      {time()}
    </div>
  );
}

function BoardView() {
  let [store, actions] = useStore();

  function keyHandler(event: KeyboardEvent) {
    if ((event.ctrlKey || event.metaKey) && event.key === "Enter") {
      actions.addTask();
    }
  }

  onMount(() => {
    window.addEventListener("keydown", keyHandler);
  });

  onCleanup(() => {
    window.removeEventListener("keydown", keyHandler);
  });

  return (
    <Show when={!store.activeSession}>
      <DragAndDrop />
    </Show>
  );
}

function DragAndDrop() {
  let [store, actions] = useStore();

  function isContainer(id: Id) {
    return ["session", "backlog"].includes(id.toString());
  }

  function getContainer(id: Id) {
    for (let [key, items] of [
      ["session", store.session],
      ["backlog", store.backlog],
    ] as const) {
      if (items.includes(+id)) {
        return key;
      }
    }
  }

  function handleDragOver({ draggable, droppable }: DragEvent) {
    if (draggable && droppable) {
      move(draggable, droppable);
    }
  }

  function handleDragEnd({ draggable, droppable }: DragEvent) {
    if (draggable && droppable) {
      move(draggable, droppable, false);
    }
  }

  function move(
    draggable: Draggable,
    droppable: Droppable,
    onlyWhenChangingContainer = true
  ) {
    const draggableContainer = getContainer(draggable.id);
    const droppableContainer = isContainer(droppable.id)
      ? (droppable.id as "session" | "backlog")
      : getContainer(droppable.id);

    if (
      draggableContainer != droppableContainer ||
      !onlyWhenChangingContainer
    ) {
      const containerItemIds =
        store[droppableContainer as "session" | "backlog"];
      let index = containerItemIds.indexOf(+droppable.id);
      if (index === -1) index = containerItemIds.length;

      batch(() => {
        actions.setStore(draggableContainer!, (items) =>
          items.filter((item) => item !== draggable.id)
        );
        actions.setStore(droppableContainer!, (items) => [
          ...items.slice(0, index),
          +draggable.id,
          ...items.slice(index),
        ]);
      });
    }
  }

  let collisionDetector: CollisionDetector = (
    draggable,
    droppables,
    context
  ) => {
    const closestContainer = closestCenter(
      draggable,
      droppables.filter((droppable) => isContainer(droppable.id)),
      context
    );
    if (closestContainer) {
      const containerItemIds =
        store[closestContainer.id as "session" | "backlog"];
      const closestItem = closestCenter(
        draggable,
        droppables.filter((droppable) =>
          containerItemIds.includes(+droppable.id)
        ),
        context
      );
      if (!closestItem) {
        return closestContainer;
      }

      if (getContainer(draggable.id) !== closestContainer.id) {
        const isLastItem =
          containerItemIds.indexOf(closestItem.id as number) ===
          containerItemIds.length - 1;

        if (isLastItem) {
          const belowLastItem =
            draggable.transformed.center.y > closestItem.transformed.center.y;

          if (belowLastItem) {
            return closestContainer;
          }
        }
      }
      return closestItem;
    }

    return null;
  };

  return (
    <DragDropProvider
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
      collisionDetector={collisionDetector}
    >
      <DragDropSensors />
      <div class="flex flex-col gap-16 mt-12">
        <Session />
        <Backlog />
      </div>
      <DragOverlay>
        {/* @ts-ignore */}
        {(draggable) => {
          if (!draggable) {
            return null;
          }

          return (
            <div class="rounded-md shadow-xl shadow-black/30 scale-105 origin-left">
              <TaskPanel>
                <DragHandlerIcon />
                <Input
                  readOnly
                  value={store.tasks[draggable.id].title}
                  placeholder="New Task"
                />
              </TaskPanel>
            </div>
          );
        }}
      </DragOverlay>
    </DragDropProvider>
  );
}

function Session() {
  let droppable = createDroppable("session");
  let [store, actions] = useStore();
  let tasks = () => store.session.map((id) => store.tasks[id]);
  let totalTime = () => tasks().reduce((p, c) => p + c.minutes, 0);

  return (
    <section class="flex flex-col gap-2">
      <div class="p-4 md:p-8 md:rounded-3xl border-y border-gray-a5 md:border-none md:shadow-1 bg-[var(--surface-1)]">
        <div class="flex flex-col gap-6">
          <div use:droppable class="flex flex-col gap-2 touch-none">
            <SortableProvider ids={store.session}>
              <For each={tasks()}>{(task) => <Task task={task} />}</For>
            </SortableProvider>

            <Show when={store.session.length === 0}>
              <div class="opacity-50">
                <TaskPanel>
                  <Input readOnly value="Drop your tasks here!" />
                </TaskPanel>
              </div>
            </Show>
          </div>

          <div class="flex justify-end items-center gap-4">
            <Show when={totalTime() > 0}>
              <span
                aria-label="Session lengths"
                class="font-light text-gray-a11 text-sm"
              >
                ~{totalTime()} min
              </span>
            </Show>
            <div>
              <Button
                color="blue"
                state={store.session.length === 0 ? "disabled" : "normal"}
                onClick={() => {
                  actions.startSession();
                }}
              >
                Start Session
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Backlog() {
  let droppable = createDroppable("backlog");

  let [store, actions] = useStore();
  let tasks = () => store.backlog.map((id) => store.tasks[id]);

  return (
    <section class="flex flex-col gap-2">
      <div>
        <div use:droppable class="flex flex-col gap-2 px-4 md:px-8 touch-none">
          <SortableProvider ids={store.backlog}>
            <For each={tasks()}>{(task) => <Task task={task} />}</For>
          </SortableProvider>
        </div>
      </div>

      <div class="flex flex-col md:flex-row justify-between gap-8 mt-4 px-4 md:px-8">
        <Show when={store.backlog.length === 0} fallback={<div />}>
          <div class="flex items-center gap-3 text-gray-a11">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke-width={1.5}
              stroke="currentColor"
              class="w-6 h-6"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M2.25 13.5h3.86a2.25 2.25 0 012.012 1.244l.256.512a2.25 2.25 0 002.013 1.244h3.218a2.25 2.25 0 002.013-1.244l.256-.512a2.25 2.25 0 012.013-1.244h3.859m-19.5.338V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18v-4.162c0-.224-.034-.447-.1-.661L19.24 5.338a2.25 2.25 0 00-2.15-1.588H6.911a2.25 2.25 0 00-2.15 1.588L2.35 13.177a2.25 2.25 0 00-.1.661z"
              />
            </svg>
            <span>Your backlog is empty!</span>
          </div>
        </Show>
        <Button
          aria-label="Create task"
          onClick={() => {
            actions.addTask();
          }}
        >
          <div class="flex items-center gap-3">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              class="w-5 h-5 touch:w-6 touch:h-6"
            >
              <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" />
            </svg>
            Create Task
          </div>
        </Button>
      </div>
    </section>
  );
}

function TaskPanel(props: ComponentProps<"div">) {
  let [local, others] = splitProps(props, ["class"]);

  return (
    <div
      {...others}
      class={`group flex justify-between items-center pl-3 pr-5 h-12 rounded-md bg-gradient-to-t from-gray-4 to-gray-2 dark:from-gray-5 dark:to-gray-6 shadow-1 ${local.class}`}
    />
  );
}

function Task(props: { task: Task }) {
  let sortable = createSortable(props.task.id);
  let [, actions] = useStore();

  return (
    <div
      use:sortable
      classList={{
        "opacity-0": sortable.isActiveDraggable,
      }}
    >
      <TaskPanel>
        <div
          class="cursor-move mr-2"
          onMouseDown={(e) => e.preventDefault()}
          onDblClick={() => {
            actions.switchTask(props.task.id);
          }}
        >
          <DragHandlerIcon />
        </div>

        <Input
          value={props.task.title}
          placeholder="New Task"
          onChange={(e) => {
            actions.modifyTask(props.task.id, "title", e.currentTarget.value);
          }}
        />

        <div class="flex gap-2">
          <div class="hidden items-center gap-1 touch:flex group-hover:flex">
            <Button
              aria-label="Delete task"
              color="red"
              size="1"
              onClick={() => {
                actions.removeTask(props.task.id);
              }}
            >
              <TrashIcon />
            </Button>
          </div>

          <div>
            <select
              aria-label="Task duration (minutes)"
              value={props.task.minutes}
              onInput={(e) => {
                actions.modifyTask(
                  props.task.id,
                  "minutes",
                  +e.currentTarget.value
                );
              }}
              class="appearance-none px-2 h-7 text-xs text-right font-extralight rounded-lg cursor-pointer bg-gray-a2 hover:bg-gray-a3 text-gray-12 shadow-input shadow-gray-a7 hover:shadow-gray-a8 active:shadow-gray-a9 focus-visible:shadow-input-focus focus-visible:shadow-gray-a8 outline-none"
            >
              <option value={5}>5 m</option>
              <option value={10}>10 m</option>
              <option value={15}>15 m</option>
              <option value={20}>20 m</option>
              <option value={25}>25 m</option>
              <option value={30}>30 m</option>
              <option value={35}>35 m</option>
              <option value={40}>40 m</option>
              <option value={45}>45 m</option>
              <option value={50}>50 m</option>
              <option value={55}>55 m</option>
              <option value={60}>60 m</option>
            </select>
          </div>
        </div>
      </TaskPanel>
    </div>
  );
}

function Input(
  props: JSX.HTMLAttributes<HTMLInputElement> &
    JSX.InputHTMLAttributes<HTMLInputElement>
) {
  return (
    <input
      {...props}
      class="mr-4 mt-[1px] rounded-none bg-transparent w-full border-b border-transparent outline-none hover:border-gray-a5 focus:border-gray-a7 placeholder:text-gray-a11 transition-colors"
    />
  );
}

function CheckMark(props: { checked: boolean }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      stroke-width={1.5}
      stroke="currentColor"
      class="w-6 h-6 text-gray-a11"
    >
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        d={`${
          props.checked ? "M9 12.75L11.25 15 15 9.75" : ""
        }M21 12a9 9 0 11-18 0 9 9 0 0118 0z`}
      />
    </svg>
  );
}

function DragHandlerIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill="currentColor"
      class="w-6 h-4"
    >
      <path
        fill-rule="evenodd"
        d="M10 3a.75.75 0 01.55.24l3.25 3.5a.75.75 0 11-1.1 1.02L10 4.852 7.3 7.76a.75.75 0 01-1.1-1.02l3.25-3.5A.75.75 0 0110 3zm-3.76 9.2a.75.75 0 011.06.04l2.7 2.908 2.7-2.908a.75.75 0 111.1 1.02l-3.25 3.5a.75.75 0 01-1.1 0l-3.25-3.5a.75.75 0 01.04-1.06z"
        clip-rule="evenodd"
      />
    </svg>
  );
}

function TrashIcon() {
  return (
    <div>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 20 20"
        fill="currentColor"
        class="w-4 h-4"
      >
        <path
          fill-rule="evenodd"
          d="M8.75 1A2.75 2.75 0 006 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 10.23 1.482l.149-.022.841 10.518A2.75 2.75 0 007.596 19h4.807a2.75 2.75 0 002.742-2.53l.841-10.52.149.023a.75.75 0 00.23-1.482A41.03 41.03 0 0014 4.193V3.75A2.75 2.75 0 0011.25 1h-2.5zM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4zM8.58 7.72a.75.75 0 00-1.5.06l.3 7.5a.75.75 0 101.5-.06l-.3-7.5zm4.34.06a.75.75 0 10-1.5-.06l-.3 7.5a.75.75 0 101.5.06l.3-7.5z"
          clip-rule="evenodd"
        />
      </svg>
    </div>
  );
}
