import { Link, useParams } from "react-router";
import { ArrowLeft } from "lucide-react";
import { useT } from "../i18n";
import { ErrorText, PageHeader, useApi } from "../ui";
import { TrainingPanel } from "../shared/Training";
import { TestChat } from "../client/chat/Agent";

/** Agency trains one client's chatbot: the same sources the client sees on their AI page, plus a test chat. */
export function ClientTrainPage() {
  const { t } = useT();
  const { id } = useParams();
  const { data, error } = useApi<{ client: { business_name: string } }>(`/api/admin/clients/${id}`);
  if (error) return <ErrorText error={error} />;
  return (
    <>
      <Link to={`/admin/clients/${id}`} className="mb-2 inline-flex items-center gap-1 text-sm text-brand-700 hover:underline"><ArrowLeft size={14} /> {data?.client.business_name ?? t("back")}</Link>
      <PageHeader title={t("train_chatbot_for", { name: data?.client.business_name ?? "…" })} />
      <div className="space-y-6">
        <TrainingPanel base={`/api/admin/clients/${id}/knowledge`} />
        <TestChat endpoint={`/api/admin/clients/${id}/test-chat`} />
      </div>
    </>
  );
}
