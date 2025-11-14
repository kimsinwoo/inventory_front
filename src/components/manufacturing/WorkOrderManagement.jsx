// src/pages/WorkOrder/WorkOrderManagement.jsx
import WorkOrderForm from './WorkOrderForm';
import WorkOrderListView from './WorkOrderListView';

const WorkOrderManagement = () => {
  return (
    <div className="p-6">
      <div className="space-y-6">
        <WorkOrderForm />
        <WorkOrderListView />
      </div>
    </div>
  );
};

export default WorkOrderManagement;
