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
        route: '/document'
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
        label: 'requirement',
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
