import Live from "../../live/Live";

export const metadata = { title: "Waypoints · Batch trace" };

export default async function RunDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <Live objectiveId={id} />;
}
