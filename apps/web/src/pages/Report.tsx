import {
  BudgetBreakdownChart,
  ExpenseBreakdownChart,
} from '../components/charts';
import { ErrorBoundary } from '../components/ErrorBoundary';
import {
  ReportBackLink,
  ReportChartSection,
  ReportHeader,
  ReportModals,
  ReportSkeleton,
  ReportSummary,
  TransactionTable,
} from '../components/reports';
import { PageLayout } from '../components/ui';
import { useReportData } from '../hooks/useReportData';

export function Report() {
  const {
    deletingTransaction,
    editingTransaction,
    error,
    isAddTransactionModalOpen,
    isBudgetChartOpen,
    isChartOpen,
    isDeleteReportModalOpen,
    isDeleting,
    isDeletingTransaction,
    loading,
    onCloseAddTransactionModal,
    onCloseDeleteReportModal,
    onCloseDeleteTransactionModal,
    onCloseEditTransactionModal,
    onConfirmDeleteReport,
    onConfirmDeleteTransaction,
    onCreateTransaction,
    onOpenAddTransactionModal,
    onOpenDeleteReportModal,
    onSaveTitle,
    onSelectTransactionForDelete,
    onSelectTransactionForEdit,
    onToggleBudgetChart,
    onToggleChart,
    onUpdateTransaction,
    report,
    transactions,
  } = useReportData();

  if (loading) {
    return <ReportSkeleton />;
  }

  if (error || !report) {
    return (
      <PageLayout>
        <ReportBackLink />

        <p className="text-center text-red-500">
          {error ? 'Failed to load report.' : 'Report not found.'}
        </p>
      </PageLayout>
    );
  }

  return (
    <>
      <PageLayout>
        <ReportBackLink />

        <ReportHeader
          title={report.title}
          onAddTransaction={onOpenAddTransactionModal}
          onDeleteReport={onOpenDeleteReportModal}
          onSaveTitle={onSaveTitle}
        />

        <ReportSummary transactions={transactions} />

        <ReportChartSection
          isOpen={isChartOpen}
          title="Expense Breakdown"
          onToggle={onToggleChart}
        >
          <ErrorBoundary compact>
            <ExpenseBreakdownChart transactions={transactions} />
          </ErrorBoundary>
        </ReportChartSection>

        <ReportChartSection
          isOpen={isBudgetChartOpen}
          title="Budget Breakdown"
          onToggle={onToggleBudgetChart}
        >
          <ErrorBoundary compact>
            <BudgetBreakdownChart transactions={transactions} />
          </ErrorBoundary>
        </ReportChartSection>

        <TransactionTable
          transactions={transactions}
          onAddTransaction={onOpenAddTransactionModal}
          onDelete={onSelectTransactionForDelete}
          onEdit={onSelectTransactionForEdit}
        />
      </PageLayout>

      <ReportModals
        deletingTransaction={deletingTransaction}
        editingTransaction={editingTransaction}
        isAddTransactionModalOpen={isAddTransactionModalOpen}
        isDeleteReportModalOpen={isDeleteReportModalOpen}
        isDeleting={isDeleting}
        isDeletingTransaction={isDeletingTransaction}
        reportTitle={report.title}
        onCloseAddTransactionModal={onCloseAddTransactionModal}
        onCloseDeleteReportModal={onCloseDeleteReportModal}
        onCloseDeleteTransactionModal={onCloseDeleteTransactionModal}
        onCloseEditTransactionModal={onCloseEditTransactionModal}
        onConfirmDeleteReport={onConfirmDeleteReport}
        onConfirmDeleteTransaction={onConfirmDeleteTransaction}
        onCreateTransaction={onCreateTransaction}
        onUpdateTransaction={onUpdateTransaction}
      />
    </>
  );
}
