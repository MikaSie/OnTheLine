import { createBrowserRouter } from "react-router-dom";

import { AppShell } from "./shell/app-shell";
import { CatchDetailPage } from "../features/catches/pages/catch-detail-page";
import { CatchFormPage } from "../features/catches/pages/catch-form-page";
import { CatchLogPage } from "../features/catches/pages/catch-log-page";
import { DashboardPage } from "../features/dashboard/pages/dashboard-page";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <AppShell />,
    children: [
      {
        index: true,
        element: <DashboardPage />,
      },
      {
        path: "catches",
        element: <CatchLogPage />,
      },
      {
        path: "catches/new",
        element: <CatchFormPage mode="create" />,
      },
      {
        path: "catches/:catchId",
        element: <CatchDetailPage />,
      },
      {
        path: "catches/:catchId/edit",
        element: <CatchFormPage mode="edit" />,
      },
    ],
  },
]);
