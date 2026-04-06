import {
  BudgetBreakdownChart,
  ExpenseBreakdownChart,
} from '../components/charts';
import { ErrorBoundary } from '../components/ErrorBoundary';
import { ReportBackLink } from '../components/reports/ReportBackLink';
import { ReportChartSection } from '../components/reports/ReportChartSection';
import { ReportHeader } from '../components/reports/ReportHeader';
import { ReportModals } from '../components/reports/ReportModals';
import { ReportSkeleton } from '../components/reports/ReportSkeleton';
import { ReportSummary } from '../components/reports/ReportSummary';
import { TransactionTable } from '../components/reports/TransactionTable';
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
          createdAt={report.createdAt}
          title={report.title}
          updatedAt={report.updatedAt}
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
