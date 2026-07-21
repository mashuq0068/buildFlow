import { Router } from "express";
import { favoriteController } from "./favorite.controller";
import { requireAuth } from "../../middlewares/requireAuth";

const nested = Router({ mergeParams: true });
nested.use(requireAuth);
nested.post("/", favoriteController.add);
nested.delete("/", favoriteController.remove);

const list = Router();
list.use(requireAuth);
list.get("/", favoriteController.list);

export const favoriteRoutes = nested;
export const favoriteListRoutes = list;
