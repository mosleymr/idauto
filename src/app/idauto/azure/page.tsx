import type { Metadata } from "next";
import AzureDashboard from "./AzureDashboard";

export const metadata: Metadata = {
	title: "Azure AD Security Overview",
};

export default function Page() {
	return <AzureDashboard />;
}
