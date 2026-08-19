import { createBrowserRouter } from "react-router"
import { RootLayout } from "./components/layout/RootLayout"
import { Dashboard } from "./pages/Dashboard"
import { Investigate } from "./pages/Investigate"
import { DomainDiscovery } from "./pages/DomainDiscovery"
import { Reports } from "./pages/Reports"
import { RecentInvestigations } from "./pages/RecentInvestigations"
import { Scanners } from "./pages/Scanners"
import { Extension } from "./pages/Extension"
import { Settings } from "./pages/Settings"
import { Auth } from "./pages/Auth"
import { ReportView } from "./pages/ReportView"

export const router = createBrowserRouter([
  {
    path: "/login",
    element: <Auth />,
  },
  {
    path: "/",
    element: <RootLayout />,
    children: [
      { index: true, element: <Dashboard /> },
      { path: "investigate", element: <Investigate /> },
      { path: "investigate/:scanId", element: <Investigate /> },
      { path: "report", element: <ReportView /> },
      { path: "discovery", element: <DomainDiscovery /> },
      { path: "history", element: <RecentInvestigations /> },
      { path: "reports", element: <Reports /> },
      { path: "scanners", element: <Scanners /> },
      { path: "extension", element: <Extension /> },
      { path: "settings", element: <Settings /> },
    ],
  },
])
