import { authMiddleware } from "@clerk/nextjs/server";

export default authMiddleware({
  publicRoutes: ["/", "/sign-in(.*)", "/privacy", "/terms", "/api/(.*)"],
  afterAuth(auth, req) {
    // If signed in and on sign-in page, redirect to /app
    if (auth.userId && req.nextUrl.pathname === "/sign-in") {
      return Response.redirect(new URL("/app", req.url));
    }
  }
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
