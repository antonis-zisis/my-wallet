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
import { ShareReportModal } from '../components/reports/ShareReportModal';
import { TransactionTable } from '../components/reports/TransactionTable';
import { PageLayout } from '../components/ui';
import { useReportData } from '../hooks/reports/useReportData';

export function Report() {
  const {
    currentUserId,
    deletingTransaction,
    editingTransaction,
    error,
    filteredTransactions,
    isAddTransactionModalOpen,
    isBudgetChartOpen,
    isChartOpen,
    isDeleteReportModalOpen,
    isDeleting,
    isDeletingTransaction,
    isLeaving,
    isLocked,
    isShareModalOpen,
    isSharing,
    loading,
    members,
    myRole,
    onCloseAddTransactionModal,
    onCloseDeleteReportModal,
    onCloseDeleteTransactionModal,
    onCloseEditTransactionModal,
    onCloseShareModal,
    onConfirmDeleteReport,
    onConfirmDeleteTransaction,
    onCreateTransaction,
    onExportCsv,
    onLeaveReport,
    onLockReport,
    onOpenAddTransactionModal,
    onOpenDeleteReportModal,
    onOpenShareModal,
    onSaveTitle,
    onSelectCategoryFilter,
    onSelectTransactionForDelete,
    onSelectTransactionForEdit,
    onSelectTypeFilter,
    onShareReport,
    onToggleBudgetChart,
    onToggleChart,
    onUnlockReport,
    onUnshareMember,
    onUpdateMemberRole,
    onUpdateTransaction,
    presentExpenseCategories,
    presentIncomeCategories,
    report,
    selectedCategoryFilter,
    selectedTypeFilter,
    transactions,
  } = useReportData();

  const canModify = !isLocked && myRole !== 'VIEWER';

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
          currentUserId={currentUserId}
          isLocked={isLocked}
          members={members}
          myRole={myRole}
          title={report.title}
          updatedAt={report.updatedAt}
          onAddTransaction={onOpenAddTransactionModal}
          onDeleteReport={onOpenDeleteReportModal}
          onExportCsv={onExportCsv}
          onLockReport={onLockReport}
          onOpenShareModal={onOpenShareModal}
          onSaveTitle={onSaveTitle}
          onUnlockReport={onUnlockReport}
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
          isLocked={!canModify}
          members={members}
          presentExpenseCategories={presentExpenseCategories}
          presentIncomeCategories={presentIncomeCategories}
          selectedCategoryFilter={selectedCategoryFilter}
          selectedTypeFilter={selectedTypeFilter}
          transactions={filteredTransactions}
          onAddTransaction={canModify ? onOpenAddTransactionModal : undefined}
          onDelete={onSelectTransactionForDelete}
          onEdit={onSelectTransactionForEdit}
          onSelectCategoryFilter={onSelectCategoryFilter}
          onSelectTypeFilter={onSelectTypeFilter}
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

      <ShareReportModal
        currentUserId={currentUserId}
        isLeaving={isLeaving}
        isOpen={isShareModalOpen}
        isSharing={isSharing}
        members={members}
        myRole={myRole}
        onClose={onCloseShareModal}
        onLeaveReport={onLeaveReport}
        onShareReport={onShareReport}
        onUnshareMember={onUnshareMember}
        onUpdateMemberRole={onUpdateMemberRole}
      />
    </>
  );
}
