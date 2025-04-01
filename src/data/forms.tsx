import expenseReport from '../assets/expenseReport.png';
import vechileReport from '../assets/vechileReport.png';
import vechileInsurance from '../assets/vechileInsurance.png';
import buidingInsurance from '../assets/buidingInsurance.png';
import buildingTax from '../assets/buildingTax.png';
import docStatus from '../assets/docStatus.png';
import dispatch from '../assets/dispatch.svg';
import performance from '../assets/performance.svg';
import requirements from '../assets/requirements.svg';
import todolist from '../assets/todolist.png';
import { Schema } from '../../amplify/data/resource';
import eyeIcon from '../assets/eye.svg';
export const formTypes = [
    {
        id: '0',
        label: 'expenseReport',
        name: 'Expense Report',
        icon: expenseReport,
        route: '/expense-report'
    },
    {
        id: '1',
        label: 'vehicleReport',
        name: 'Vehicle Report',
        icon: vechileReport,
        route: '/vehicle-report'
    },
    {
        id: '2',
        label: 'vehicleInsurance',
        name: 'Vehicle Insurance',
        icon: vechileInsurance,
        route: '/vehicle-insurance'
    },
    {
        id: '3',
        label: 'buildingInsurance',
        name: 'Building Insurance',
        icon: buidingInsurance,
        route: '/building-insurance'
    },
    {
        id: '4',
        label: 'buildingMclTax',
        name: 'Building Mcl Tax',
        icon: buildingTax,
        route: '/building-mcl-tax'
    },
    {
        id: '5',
        label: 'documentFileStatus',
        name: 'Document File Status',
        icon: docStatus,
        route: '/document-file-status'
    },
    {
        id: '6',
        label: 'toDoList',
        name: 'To Do List',
        icon: todolist,
        route: '/todo-list'
    },
    {
        id: '7',
        label: 'requirements',
        name: 'Requirement',
        icon: requirements,
        route: '/requirements'
    },
    {
        id: '8',
        label: 'dispatchInstructions',
        name: 'Dispatch Instructions',
        icon: dispatch,
        route: '/dispatch-instructions'
    },
    {
        id: '9',
        label: 'salesManPerformance',
        name: 'Sales Man Performance',
        icon: performance,
        route: '/performance'
    }
];

export const formLabelMap: Record<string, string> = formTypes.reduce(
    (acc, { label, name }) => {
        acc[label] = name;
        return acc;
    },
    {} as Record<string, string>
);

type Form = Schema['Form']['type'];
export const expenseReport_itemsColumns = [
    {
        key: 'createdAt',
        header: 'Created At',
        render: (item: Form) => new Date(item.createdAt).toLocaleString()
    },
    {
        key: 'expenseReport_personName',
        header: 'Person Name'
    },
    {
        key: 'expenseReport_workAssign',
        header: 'Work Assign'
    },
    {
        key: 'expenseReport_balanceBF',
        header: 'Balance B/F'
    },
    {
        key: 'expenseReport_payment',
        header: 'Payment (Petty Cash)'
    },
    {
        key: 'expenseReport_expense',
        header: 'Expense'
    },
    {
        key: 'expenseReport_balance',
        header: 'Balance C/F'
    },
    {
        key: 'expenseReport_remarks',
        header: 'Remarks'
    }
];

export const buildingInsurance_itemsColumns = [
    {
        key: 'createdAt',
        header: 'Created At',
        render: (item: Form) => new Date(item.createdAt).toLocaleString()
    },
    {
        key: 'buildingInsurance_buildingName',
        header: 'Building Name'
    },
    {
        key: 'buildingInsurance_insuranceDate',
        header: 'Insurance Date'
    },
    {
        key: 'buildingInsurance_insureAmount',
        header: 'Insure Amount'
    },
    {
        key: 'buildingInsurance_insuranceAmount',
        header: 'Insurance Amount'
    },

    {
        key: 'expirationDate',
        header: 'Due Date'
    },
    {
        key: 'buildingInsurance_status',
        header: 'Status',
        render: item => (
            <div
                style={{
                    color:
                        item.buildingInsurance_status === 'PAID'
                            ? 'green'
                            : 'red'
                }}
            >
                {item.buildingInsurance_status}
            </div>
        )
    },
    {
        key: 'buildingInsurance_documentNo',
        header: 'Document No.'
    },
    {
        key: 'buildingInsurance_markToName',
        header: 'Mark To'
    }
];


export   const buildingMclTax_itemsColumns = [
    {
        key: 'buildingMclTax_buildingName',
        header: 'Building Name'
    },
    {
        key: 'buildingMclTax_buildingTax',
        header: 'Building Tax'
    },
    {
        key: 'expirationDate',
        header: 'Due Date'
    },
    {
        key: 'buildingMclTax_taxType',
        header: 'Tax Type'
    },
    {
        key: 'buildingMclTax_status',
        header: 'Status',
        render: item => (
            <div
                style={{
                    color:
                        item.buildingMclTax_status === 'PAID'
                            ? 'green'
                            : 'red'
                }}
            >
                {item.buildingMclTax_status}
            </div>
        )
    },

    {
        key: 'buildingMclTax_paidDate',
        header: 'Paid On'
    },
    {
        key: 'buildingMclTax_documentFileNo',
        header: 'Document File No.'
    },
    {
        key: 'createdAt',
        header: 'Created At',
        render: (item: Form) => new Date(item.createdAt).toLocaleString()
    }
];

export    const documentFileStatus_itemsColumns = [
    {
        key: 'createdAt',
        header: 'Created At',
        render: (item: Form) =>
            new Date(item.createdAt).toLocaleString().split(',')?.[0]
    },
    {
        key: 'documentFileStatus_status',
        header: 'Status',
        render: (item: Form) => {
            return item.documentFileStatus_status === 'in'
                ? 'In File'
                : 'Out File';
        }
    },
    {
        key: 'documentFileStatus_inDate_outDate',
        header: 'In Date / Out Date'
    },
    {
        key: 'documentFileStatus_fileName',
        header: 'File Name'
    },

    {
        key: 'documentFileStatus_documentName',
        header: 'Document Name'
    },
    {
        key: 'documentFileStatus_year',
        header: 'Year'
    },

    {
        key: 'documentFileStatus_window',
        header: 'Window Name'
    },
    {
        key: 'documentFileStatus_documentType',
        header: 'Document Type'
    },

    {
        key: 'documentFileStatus_fileNo',
        header: 'File No.'
    },
    {
        key: 'expirationDate',
        header: 'Date Expiry'
    },
    {
        key: 'documentFileStatus_receivedFrom_givenByName',
        header: 'Received From / Given By'
    },
    {
        key: 'documentFileStatus_receivedBy_givenToName',
        header: 'Received By / Given To'
    },
    {
        key: 'documentFileStatus_remarks',
        header: 'Remarks'
    }
];

const workStatusMap = {
    pending: <div style={{color:'red'}}>PENDING</div>,
    inprogress: <div style={{color:'darkorange'}}>IN PROGRESS</div>,
    completed: <div style={{color:'green'}}>COMPLETED</div>
};
 // Define columns for the People | Party list
 export const toDoList_itemsColumns = [
    {
        key: 'createdAt',
        header: 'Created At',
        render: (item: Form) => new Date(item.createdAt).toLocaleString()
    },
    {
        key: 'toDoList_assignName',
        header: 'Assign'
    },
    {
        key: 'toDoList_jointAssignName',
        header: 'Joint Assign'
    },
    {
        key: 'toDoList_jointWork',
        header: 'Joint work'
    },
    {
        key: 'toDoList_work',
        header: 'Work'
    },
    {
        key: 'expirationDate',
        header: 'Dead Line'
    },

    {
        key: 'toDoList_reportToName',
        header: 'Report To'
    },
    {
        key: 'toDoList_workStatus',
        header: 'Work Status',
        render: (item: Form) =>
            workStatusMap[item.toDoList_workStatus] ||
            item.toDoList_workStatus
    },
    {
        key: 'toDoList_nextDate',
        header: 'Next Date'
    },
    {
        key: 'toDoList_remarks',
        header: 'Remarks'
    }
];

export const  requirements_itemsColumns = [
    {
        key: 'createdAt',
        header: 'Created At',
        render: (item: Form) => new Date(item.createdAt).toLocaleString()
    },
    {
        key: 'requirements_demandFromName',
        header: 'Demand From'
    },
    {
        key: 'requirements_responsiblePersonName',
        header: 'Responsible Person'
    },
    {
        key: 'requirements_itemList',
        header: 'Requirements',
        render: (item: Form) => (
            <ul>
                {item.requirements_itemList.map((req, index) => {
                    const price = req.itemPrice;
                    const quantity = req.itemQuantity;
                    const total = (price * quantity).toFixed(2);
                    return (
                        <li key={index}>
                            {req.itemName} - ₹{price.toFixed(2)} x{' '}
                            {quantity} = ₹{total}
                        </li>
                    );
                })}
            </ul>
        )
    },
    {
        key: 'expirationDate',
        header: 'Deadline'
    },
    {
        key: 'requirements_remarks',
        header: 'Remarks'
    }
];

export const salesManPerformance_itemsColumns = [
    {
        key: 'createdAt',
        header: 'Created At',
        render: (item: Form) =>
            new Date(item.createdAt).toLocaleString().split(',')?.[0]
    },
    {
        key: 'salesManPerformance_year_month',
        header: 'Performance Period'
    },
    {
        key: 'salesManPerformance_salesManName',
        header: 'Sales Man'
    },
    {
        key: 'salesManPerformance_salary',
        header: 'Salary'
    },
    {
        key: 'salesManPerformance_expense',
        header: 'Expense'
    },
    {
        key: 'salesManPerformance_totalExpense',
        header: 'Total Expense',
        render: (item: Form) =>
            item.salesManPerformance_salary +
            item.salesManPerformance_expense
    },
    {
        key: 'salesManPerformance_salesInRupees',
        header: 'Sales In Rupees'
    },
    {
        key: 'salesManPerformance_salesInKgs',
        header: 'Sales In Kgs'
    },
    {
        key: 'salesManPerformance_skus',
        header: 'SKUs - (Targets)',
        render: (item: Form) => (
            <ul>
                {item.salesManPerformance_skus.map((req, index) => (
                    <li key={index}>
                        ₹{req.sku} - (₹{req.target})
                    </li>
                ))}
            </ul>
        )
    },
    {
        key: 'salesManPerformance_totalSales',
        header: 'Total',
        render: (item: Form) => {
            const totalSales = item.salesManPerformance_skus.reduce(
                (acc: number, curr: { sku: number; target: number }) =>
                    acc + curr.sku,
                0
            );
            return <span>₹{totalSales}</span>;
        }
    },
    {
        key: 'salesManPerformance_avarage_Expence_Amount',
        header: 'Avg. Exp. Amount',
        render: (item: Form) => {
            const salaryAndExpense =
                item.salesManPerformance_salary +
                item.salesManPerformance_expense;
            const salesInRupees = item.salesManPerformance_salesInRupees;

            const percentage =
                salesInRupees > 0 && salaryAndExpense > 0
                    ? (salaryAndExpense / salesInRupees) * 100
                    : 0;

            return percentage.toFixed(2);
        }
    },
    {
        key: 'salesManPerformance_avarage_Expence_Weight',
        header: 'Avg. Exp. Weight',
        render: (item: Form) => {
            const salaryAndExpense =
                item.salesManPerformance_salary +
                item.salesManPerformance_expense;
            const totalSales = item.salesManPerformance_skus.reduce(
                (acc: number, curr: { sku: number; target: number }) =>
                    acc + curr.sku,
                0
            );

            return totalSales > 0 && salaryAndExpense > 0
                ? (salaryAndExpense / totalSales).toFixed(2)
                : '0.00';
        }
    }
];

export function dispatchInstructionsHeader(setViewDescription){
    const itemsColumns = [
        {
            key: 'createdAt',
            header: 'Created At',
            render: (item: Form) => new Date(item.createdAt).toLocaleString()
        },
        {
            key: 'dispatchInstructions_partyName',
            header: 'Party Name'
        },
        {
            key: 'dispatchInstructions_instructions',
            header: 'Instructions',
            render: (item: Form) => (
                <div className="flexbox-between">
                    <p>
                        {item.dispatchInstructions_instructions.slice(0, 40)}
                        {item.dispatchInstructions_instructions.length > 40
                            ? '...'
                            : ''}
                    </p>
                    <img
                        className="pointer"
                        src={eyeIcon}
                        alt="View"
                        width="30"
                        height="30"
                        onClick={() =>
                            setViewDescription({
                                value: item.dispatchInstructions_instructions,
                                isOpen: true
                            })
                        }
                    />
                </div>
            )
        },
        {
            key: 'dispatchInstructions_responsiblePersonName',
            header: 'Responsible Person'
        },
        {
            key: 'dispatchInstructions_remarks',
            header: 'Remarks'
        }
    ];
return  itemsColumns
}

export function dummy(){
    return <></>
}