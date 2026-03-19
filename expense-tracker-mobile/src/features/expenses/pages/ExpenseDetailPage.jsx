import { useParams, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { ArrowLeft, Pencil, Trash2 } from "lucide-react";
import { PageContainer } from "@/shared/components/PageContainer";
import { AppCard } from "@/shared/components/AppCard";
import { AppButton } from "@/shared/components/AppButton";
import { AppBadge } from "@/shared/components/AppBadge";
import { AppIcon } from "@/shared/components/AppIcon";
import { LoadingSpinner } from "@/shared/components/LoadingSpinner";
import { useLanguage } from "@/shared/hooks/useLanguage";
import { useMoneyFormatter } from "@/shared/hooks/settings/useMoneyFormatter";
import { fetchExpenseByIdAction, deleteExpenseAction } from "@/redux/expenses/expenses.actions";
import { selectSelectedExpense, selectExpenseLoading } from "@/redux/selectors";

export function ExpenseDetailPageView() {
  const { t } = useLanguage();
  const { format } = useMoneyFormatter();
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const expense = useSelector(selectSelectedExpense);
  const loading = useSelector(selectExpenseLoading);

  useEffect(() => {
    if (id) dispatch(fetchExpenseByIdAction(id));
  }, [id, dispatch]);

  const handleDelete = async () => {
    const result = await dispatch(deleteExpenseAction(id));
    if (result?.success) navigate("/expenses");
  };

  if (loading || !expense) {
    return <PageContainer><LoadingSpinner size="lg" className="mt-20" /></PageContainer>;
  }

  return (
    <PageContainer maxWidth="md">
      <div className="flex items-center gap-3 mb-6">
        <AppButton variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <AppIcon icon={ArrowLeft} color="foreground" size="md" />
        </AppButton>
        <h1 className="text-xl font-bold flex-1">{expense.name}</h1>
        <AppButton variant="outline" size="icon" onClick={() => navigate(`/expenses/edit/${id}`)}>
          <AppIcon icon={Pencil} color="soft" size="sm" />
        </AppButton>
        <AppButton variant="outline" size="icon" onClick={handleDelete}>
          <AppIcon icon={Trash2} color="error" size="sm" />
        </AppButton>
      </div>

      <AppCard className="p-4 md:p-6 space-y-4">
        <div className="text-center pb-4 border-b">
          <p className="text-3xl font-bold">{format(expense.amount)}</p>
          <p className="text-sm text-muted-foreground mt-1">{expense.date}</p>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-muted-foreground">{t("expenses.form.category")}</p>
            <p className="font-medium">{expense.category || "-"}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">{t("expenses.form.type")}</p>
            <AppBadge variant="secondary">{expense.type || "-"}</AppBadge>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">{t("expenses.form.paymentMethod")}</p>
            <p className="font-medium">{expense.paymentMethod || "-"}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">{t("expenses.form.recurring")}</p>
            <p className="font-medium">{expense.isRecurring ? t("common.yes") : t("common.no")}</p>
          </div>
        </div>
        {expense.comments && (
          <div className="pt-4 border-t">
            <p className="text-xs text-muted-foreground mb-1">{t("expenses.form.comments")}</p>
            <p className="text-sm">{expense.comments}</p>
          </div>
        )}
      </AppCard>
    </PageContainer>
  );
}

export default ExpenseDetailPageView;
