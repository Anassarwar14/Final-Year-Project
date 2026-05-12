import { Hono } from "hono";
import { learningHubController } from "./controller";

const learningHubRoutes = new Hono()
  .get("/courses", learningHubController.listCourses)
  .get("/courses/:courseId", learningHubController.getCourse)
  .post("/courses/:courseId/favorite", learningHubController.setFavorite)
  .post("/courses/:courseId/watch-later", learningHubController.setWatchLater)
  .post("/chapters/:chapterId/complete", learningHubController.completeChapter);

export default learningHubRoutes;
