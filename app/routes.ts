import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("buat", "routes/create.tsx"),
  route("kebiasaan/:id", "routes/habit.$id.tsx"),
] satisfies RouteConfig;
