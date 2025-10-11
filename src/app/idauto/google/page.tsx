import type { Metadata } from "next";
import GoogleDashboard from "./GoogleDashboard";

export const metadata: Metadata = {
	title: "Google Workspace Identity Security Overview",
};

export default function Page() {
	return <GoogleDashboard />;
}
