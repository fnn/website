import type { APIRoute } from "astro";

export const get: APIRoute = async function get({ params, redirect }) {
  return redirect(`https://developer.mozilla.org/search?q=${params.query}`);
};
