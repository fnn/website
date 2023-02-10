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
  createContext,
  createSignal,
  For,
  JSX,
  JSXElement,
  onCleanup,
  Show,
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
        let index = store.backlog.indexOf(id);
        batch(() => {
          setStore("backlog", (tasks) => [
            ...tasks.slice(0, index),
            ...tasks.slice(index + 1),
          ]);
          setStore("tasks", (tasks) => {
            delete tasks[id];
            return tasks;
          });
        });
      },
      modifyTask(id: number, prop: keyof Task, value: any) {
        setStore("tasks", id, prop, value);
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
      <div class="flex flex-col gap-12 p-4 md:p-6 rounded-3xl md:border select-none border-slate-200 dark:border-slate-800 shadow-2xl shadow-gray-300 dark:shadow-none">
        <div>
          <div class="mb-2 text-3xl font-medium">Session finished</div>
          <div class="text-slate-500 dark:text-slate-400">
            You have estimated that you need{" "}
            <span class="font-semibold text-blue-600 dark:text-blue-300">
              {userEstimation()} min
            </span>{" "}
            for your tasks and you actually needed{" "}
            <span
              class="font-semibold"
              classList={{
                "text-green-500": userEstimation() > actualTime(),
                "text-red-500": userEstimation() + 10 < actualTime(),
              }}
            >
              {actualTime()} min
            </span>
            . {userEstimation() + 10 < actualTime() ? " " : "Good Job!"}
          </div>
        </div>

        <div class="flex justify-between items-center">
          <div>
            <div class="mb-3 text-sm font-extralight text-slate-500 dark:text-slate-400 dark:opacity-80 select-none">
              START
            </div>
            <div class="text-4xl md:text-5xl font-medium">
              {new Date(store.activeSession!.start)
                .toISOString()
                .substring(11, 16)}
            </div>
          </div>
          <div class="flex gap-1 items-center mt-7 text-slate-500 dark:text-slate-400 dark:opacity-80">
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
            <div class="mb-3 text-sm font-extralight text-slate-500 dark:text-slate-400 dark:opacity-80 select-none">
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
            <h2 class="text-sm font-extralight text-slate-500 dark:text-slate-400 dark:opacity-80 select-none">
              COMPLETED
            </h2>
            <For each={finishedTasks()}>
              {(task) => (
                <div class="flex justify-between items-center px-4 h-12 transition-opacity opacity-100 rounded-md bg-slate-50 dark:bg-slate-800 border dark:border-slate-700 border-slate-200 select-none">
                  <div class="flex gap-3 items-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke-width={1.5}
                      stroke="currentColor"
                      class="w-6 h-6 transition-colors text-green-600 dark:text-green-300"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>

                    <div>{task.title}</div>
                  </div>
                  <div class="px-2 py-1 text-xs text-slate-500 dark:text-slate-400 text-right font-extralight rounded bg-transparent border border-slate-200 dark:border-slate-700 select-none">
                    {task.minutes} m
                  </div>
                </div>
              )}
            </For>
          </div>
        </Show>

        <Show when={unfinishedTasks().length !== 0}>
          <div class="flex flex-col gap-2">
            <h2 class="text-sm font-extralight text-slate-500 dark:text-slate-400 dark:opacity-80 select-none">
              NOT COMPLETED
            </h2>
            <For each={unfinishedTasks()}>
              {(task) => (
                <div class="flex justify-between items-center px-4 py-2 transition-opacity opacity-100 rounded-md bg-slate-50 dark:bg-slate-800 border dark:border-slate-700 border-slate-200 select-none">
                  <div class="flex gap-3 items-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke-width={1.5}
                      stroke="currentColor"
                      class="w-6 h-6 transition-colors text-slate-400"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>

                    <div>{task.title}</div>
                  </div>
                  <div class="px-2 py-1 text-xs text-slate-500 dark:text-slate-400 text-right font-extralight rounded bg-transparent border border-slate-200 dark:border-slate-700 select-none">
                    {task.minutes} m
                  </div>
                </div>
              )}
            </For>
          </div>
        </Show>

        <div class="flex justify-end">
          <div>
            <button
              class="text-white bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:ring-blue-300 font-medium rounded-3xl text-sm px-4 py-2 touch:px-7 touch:py-3 focus:outline-none dark:focus:ring-blue-800 disabled:bg-blue-600 disabled:opacity-40 transition-all"
              onClick={() => {
                actions.closeSession();
              }}
            >
              Close Session
            </button>
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
      <div class="flex flex-col gap-24 p-4 md:p-6 rounded-3xl border border-transparent">
        {/* Active Task */}
        <div>
          <h2 class="mb-3 text-sm font-extralight text-slate-500 dark:text-slate-400 dark:opacity-80 select-none">
            WORKING ON
          </h2>
          <div class="md:scale-[1.265] flex justify-between items-center px-3 h-12 transition-opacity font-medium rounded-md md:rounded-xl shadow-lg cursor-default bg-gradient-to-t from-blue-700 to-blue-500 dark:from-blue-900 dark:to-blue-600 text-blue-100">
            <div class="flex items-center gap-3">
              <button
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
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke-width={1.5}
                  stroke="currentColor"
                  class="w-6 h-6 transition-colors text-blue-100 hover:animate-pulse"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </button>
              <div>{activeTask()?.title}</div>
            </div>
            <div class="px-2 py-1 text-sm text-blue-100 text-right font-extralight rounded bg-transparent select-none">
              {activeTask()!.minutes} m
            </div>
          </div>
        </div>

        {/* Unfinished Tasks */}
        <Show when={unfinishedTasks().length !== 0}>
          <div class="flex flex-col gap-2">
            <h2 class="text-sm font-extralight text-slate-500 dark:text-slate-400 dark:opacity-80 select-none">
              STILL TO DO
            </h2>
            <For each={unfinishedTasks()}>
              {(task) => (
                <button
                  class="flex justify-between items-center px-3 h-12 transition-opacity opacity-80 hover:opacity-100 rounded-md bg-slate-50 dark:bg-slate-800 border dark:border-slate-700 border-slate-200 cursor-pointer select-none"
                  onClick={() => {
                    actions.setStore("session", [
                      task.id,
                      ...store.session.filter((id) => id !== task.id),
                    ]);
                  }}
                >
                  <div class="flex items-center gap-3">
                    {/* <div class="w-6" /> */}
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      stroke-width={1.5}
                      fill="currentColor"
                      class="w-6 h-6 opacity-40"
                    >
                      <path
                        fill-rule="evenodd"
                        clip-rule="evenodd"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z"
                      />
                    </svg>

                    <div>{task.title}</div>
                  </div>
                  <Show when={!task.done}>
                    <div class="px-2 py-1 text-xs text-slate-500 dark:text-slate-400 text-right font-extralight rounded bg-transparent border border-slate-200 dark:border-slate-700 select-none">
                      {task.minutes} m
                    </div>
                  </Show>
                </button>
              )}
            </For>
          </div>
        </Show>

        {/* Finished Tasks */}
        <Show when={finishedTasks().length !== 0}>
          <div class="flex flex-col gap-2">
            <h2 class="text-sm font-extralight text-slate-500 dark:text-slate-400 dark:opacity-80 select-none">
              DONE
            </h2>
            <For each={finishedTasks()}>
              {(task) => (
                <div class="flex justify-between items-center px-3 h-12 opacity-50 dark:opacity-30 rounded-md border border-slate-200 dark:border-slate-700 cursor-default">
                  <div class="flex items-center gap-3">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke-width={1.5}
                      stroke="currentColor"
                      class="w-6 h-6 transition-colors text-green-600 dark:text-green-300"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <div class="line-through">{task.title}</div>
                  </div>
                  <Show when={!task.done}>
                    <div class="px-2 py-1 text-xs text-slate-500 dark:text-slate-400 text-right font-extralight rounded bg-transparent border border-slate-200 dark:border-slate-700 select-none">
                      {task.minutes} m
                    </div>
                  </Show>
                </div>
              )}
            </For>
          </div>
        </Show>
        <div class="flex justify-end">
          <button
            class="text-slate-800 dark:text-white border border-slate-200 hover:bg-slate-100 dark:border-slate-800 dark:hover:border-slate-700 dark:hover:bg-slate-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-3xl text-sm px-4 py-2 touch:px-7 touch:py-3  focus:outline-none dark:focus:ring-blue-800 disabled:bg-blue-600 disabled:opacity-40 transition-all"
            onClick={() => actions.endSession()}
          >
            End Session
          </button>
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
      class="flex justify-center my-6 md:my-12 text-slate-200 dark:text-slate-800 text-7xl font-medium select-none hover:opacity-100 transition-opacity duration-[6s] tabular-nums drop-shadow-xl"
      classList={{
        "opacity-0 touch:opacity-100": hide(),
      }}
    >
      {time()}
    </div>
  );
}

function BoardView() {
  let [store] = useStore();

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
            <div class="flex justify-between items-center px-3 h-12 rounded-md bg-slate-50 dark:bg-slate-800 border dark:border-slate-700 border-slate-200 shadow-xl scale-105 -rotate-1 origin-left">
              <div class="w-4 mr-2" />
              <Input
                readOnly
                value={store.tasks[draggable.id].title}
                placeholder="New Task"
              />
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
      <div class="hidden items-center gap-2 dark:text-slate-400 text-slate-500">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
          class="w-4 h-4"
        >
          <path
            fill-rule="evenodd"
            d="M4.606 12.97a.75.75 0 01-.134 1.051 2.494 2.494 0 00-.93 2.437 2.494 2.494 0 002.437-.93.75.75 0 111.186.918 3.995 3.995 0 01-4.482 1.332.75.75 0 01-.461-.461 3.994 3.994 0 011.332-4.482.75.75 0 011.052.134z"
            clip-rule="evenodd"
          ></path>
          <path
            fill-rule="evenodd"
            d="M5.752 12A13.07 13.07 0 008 14.248v4.002c0 .414.336.75.75.75a5 5 0 004.797-6.414 12.984 12.984 0 005.45-10.848.75.75 0 00-.735-.735 12.984 12.984 0 00-10.849 5.45A5 5 0 001 11.25c.001.414.337.75.751.75h4.002zM13 9a2 2 0 100-4 2 2 0 000 4z"
            clip-rule="evenodd"
          ></path>
        </svg>

        <h1 class="font-light text-sm">Session</h1>
      </div>

      <div class="p-4 md:p-6 rounded-3xl md:border select-none border-slate-200 dark:border-slate-800 shadow-2xl shadow-gray-300 dark:shadow-none">
        <div class="flex flex-col gap-6">
          <div use:droppable class="flex flex-col gap-2 touch-none">
            <SortableProvider ids={store.session}>
              <For each={tasks()}>
                {(task) => <Task type="session" task={store.tasks[task.id]} />}
              </For>
            </SortableProvider>

            <Show when={store.session.length === 0}>
              <div class="flex justify-between items-center px-3 h-12 opacity-40 rounded-md bg-slate-50 dark:bg-slate-800 border dark:border-slate-700 border-slate-200">
                <Input readOnly value="Drop your tasks here!" />
              </div>
            </Show>
          </div>

          <div class="flex justify-end">
            <div>
              <button
                class="text-white bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:ring-blue-300 font-medium rounded-3xl text-sm px-4 py-2 touch:px-7 touch:py-3 focus:outline-none dark:focus:ring-blue-800 disabled:bg-blue-600 disabled:opacity-40 transition-all"
                disabled={store.session.length === 0}
                onClick={() => {
                  actions.startSession();
                }}
              >
                Start Session {totalTime() !== 0 ? `(${totalTime()} min)` : ""}
              </button>
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
      <div class="flex justify-between">
        <div class="hidden items-center gap-2 dark:text-slate-400 text-slate-500">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            class="w-4 h-4"
          >
            <path d="M2 3a1 1 0 00-1 1v1a1 1 0 001 1h16a1 1 0 001-1V4a1 1 0 00-1-1H2z"></path>
            <path
              fill-rule="evenodd"
              d="M2 7.5h16l-.811 7.71a2 2 0 01-1.99 1.79H4.802a2 2 0 01-1.99-1.79L2 7.5zM7 11a1 1 0 011-1h4a1 1 0 110 2H8a1 1 0 01-1-1z"
              clip-rule="evenodd"
            ></path>
          </svg>

          <h1 class="font-light text-sm">Backlog</h1>
        </div>
      </div>

      <div>
        <div use:droppable class="flex flex-col gap-2 px-6 touch-none">
          <SortableProvider ids={store.backlog}>
            <For each={tasks()}>
              {(task) => <Task type="backlog" task={task} />}
            </For>
          </SortableProvider>
        </div>
      </div>

      <Show when={store.backlog.length !== 0}>
        <div class="flex justify-center mt-4">
          <button
            aria-label="Create task"
            class="gap-2 rounded-full p-2 transition-colors text-blue-600 bg-blue-50 hover:bg-blue-100 dark:text-blue-400 dark:bg-blue-900/30 dark:hover:bg-blue-900/50 touch:p-4"
            onClick={() => {
              actions.addTask();
            }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              class="w-5 h-5 touch:w-6 touch:h-6"
            >
              <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" />
            </svg>
          </button>
        </div>
      </Show>

      <Show when={store.backlog.length === 0}>
        <div
          class="flex flex-col justify-center items-center gap-8"
          classList={{
            "opacity-20 touch:opacity-100 hover:opacity-100 transition-opacity duration-500":
              store.session.length !== 0,
          }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke-width={1.5}
            stroke="currentColor"
            class="w-24 h-24 text-blue-400 opacity-40 dark:opacity-20"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M2.25 13.5h3.86a2.25 2.25 0 012.012 1.244l.256.512a2.25 2.25 0 002.013 1.244h3.218a2.25 2.25 0 002.013-1.244l.256-.512a2.25 2.25 0 012.013-1.244h3.859m-19.5.338V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18v-4.162c0-.224-.034-.447-.1-.661L19.24 5.338a2.25 2.25 0 00-2.15-1.588H6.911a2.25 2.25 0 00-2.15 1.588L2.35 13.177a2.25 2.25 0 00-.1.661z"
            />
          </svg>
          <div class="flex flex-col gap-4 text-lg font-medium items-center">
            <span class="select-none">Your backlog is empty!</span>
            <button
              class="text-white bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:ring-blue-300 font-medium rounded-3xl text-sm px-4 py-2 touch:px-7 touch:py-3 focus:outline-none dark:focus:ring-blue-800 transition-colors"
              onClick={() => {
                actions.addTask();
              }}
            >
              Create Task
            </button>
          </div>
        </div>
      </Show>
    </section>
  );
}

function Task(props: { type: "session" | "backlog"; task: Task }) {
  let [, actions] = useStore();
  let sortable = createSortable(props.task.id);

  return (
    <div
      use:sortable
      class="group flex justify-between items-center px-3 h-12 rounded-md bg-slate-50 dark:bg-slate-800 border dark:border-slate-700 border-slate-200"
      classList={{
        "opacity-30": sortable.isActiveDraggable,
      }}
    >
      <div class="cursor-move mr-2 text-slate-500">
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
      </div>

      <Input
        value={props.task.title}
        placeholder="New Task"
        onChange={(e) => {
          actions.modifyTask(props.task.id, "title", e.currentTarget.value);
        }}
      />

      <div class="flex gap-2">
        <div class="flex items-center gap-1 lg:opacity-0 group-hover:opacity-100 transition-opacity">
          <Show when={props.type === "backlog"}>
            <button
              aria-label="Delete task"
              onClick={() => {
                actions.removeTask(props.task.id);
              }}
              class="h-6 touch:h-8 touch:w-8 text-slate-400 dark:text-slate-500 hover:text-red-700 hover:bg-red-100 hover:dark:bg-red-900/25 rounded w-6 flex justify-center items-center"
            >
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
            </button>
          </Show>
        </div>

        <Show when={props.type === "session"}>
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
              class="appearance-none px-2 py-1 touch:py-2 text-xs text-slate-500 dark:text-slate-400 text-right font-extralight rounded bg-transparent border border-slate-200 hover:border-slate-300 dark:border-slate-700 hover:dark:border-slate-600 cursor-pointer"
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
        </Show>
      </div>
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
      class="mr-4 mt-[1px] rounded-none bg-transparent w-full border-b border-transparent outline-none focus:border-slate-300 focus:dark:border-slate-600 placeholder:text-slate-400 dark:placeholder:text-slate-500 transition-colors"
    />
  );
}
