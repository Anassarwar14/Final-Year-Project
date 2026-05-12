import type { Context } from "hono";
import type { HubCourseCategory } from "@prisma/client";
import { auth } from "@/server/lib/auth";
import { learningHubService } from "./service";

const categories = new Set<string>(["CRYPTO", "TRADING", "FINANCE"]);

function parseCategory(q: string | undefined): HubCourseCategory | undefined {
  if (!q || q === "all") return undefined;
  const up = q.toUpperCase();
  if (!categories.has(up)) return undefined;
  return up as HubCourseCategory;
}

export const learningHubController = {
  async listCourses(c: Context) {
    try {
      const session = await auth.api.getSession({ headers: c.req.raw.headers });
      const userId = session?.user?.id ?? null;
      const category = parseCategory(c.req.query("category"));
      const courses = await learningHubService.listCourses(userId, category);
      return c.json({ courses });
    } catch (e) {
      console.error("learningHub listCourses", e);
      const message =
        e instanceof Error ? e.message : "Failed to load courses";
      return c.json({ error: message }, 500);
    }
  },

  async getCourse(c: Context) {
    try {
      const courseId = c.req.param("courseId");
      const session = await auth.api.getSession({ headers: c.req.raw.headers });
      const userId = session?.user?.id ?? null;
      const course = await learningHubService.getCourseDetail(courseId, userId);
      if (!course) {
        return c.json({ error: "Course not found" }, 404);
      }
      return c.json({ course });
    } catch (e) {
      console.error("learningHub getCourse", e);
      return c.json({ error: "Failed to load course" }, 500);
    }
  },

  async setFavorite(c: Context) {
    const session = await auth.api.getSession({ headers: c.req.raw.headers });
    if (!session?.user?.id) {
      return c.json({ error: "Unauthorized" }, 401);
    }
    const courseId = c.req.param("courseId");
    let body: { active?: boolean } = {};
    try {
      body = await c.req.json();
    } catch {
      /* empty body */
    }
    const active = body.active !== false;
    const result = await learningHubService.setInteraction(
      session.user.id,
      courseId,
      "FAVORITE",
      active
    );
    if (!result.ok) {
      return c.json({ error: result.error }, 404);
    }
    return c.json({ active: result.active });
  },

  async setWatchLater(c: Context) {
    const session = await auth.api.getSession({ headers: c.req.raw.headers });
    if (!session?.user?.id) {
      return c.json({ error: "Unauthorized" }, 401);
    }
    const courseId = c.req.param("courseId");
    let body: { active?: boolean } = {};
    try {
      body = await c.req.json();
    } catch {
      /* empty */
    }
    const active = body.active !== false;
    const result = await learningHubService.setInteraction(
      session.user.id,
      courseId,
      "WATCH_LATER",
      active
    );
    if (!result.ok) {
      return c.json({ error: result.error }, 404);
    }
    return c.json({ active: result.active });
  },

  async completeChapter(c: Context) {
    const session = await auth.api.getSession({ headers: c.req.raw.headers });
    if (!session?.user?.id) {
      return c.json({ error: "Unauthorized" }, 401);
    }
    const chapterId = c.req.param("chapterId");
    let body: { answers?: Record<string, number> } = {};
    try {
      body = await c.req.json();
    } catch {
      return c.json({ error: "Invalid JSON body" }, 400);
    }
    const answers = body.answers ?? {};
    const result = await learningHubService.completeChapter(
      session.user.id,
      chapterId,
      answers
    );
    if (!result.ok) {
      return c.json({ error: result.error }, 400);
    }
    return c.json({
      progressPercent: result.progressPercent,
      courseId: result.courseId,
    });
  },
};
