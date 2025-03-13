import expenseReport from '../assets/expenseReport.png';
import vechileReport from '../assets/vechileReport.png';
import vechileInsurance from '../assets/vechileInsurance.png';
import buidingInsurance from '../assets/buidingInsurance.png';
import buildingTax from '../assets/buildingTax.png';
import docStatus from '../assets/docStatus.png';

export const formTypes = [
    {
        id: '0',
        label: 'expenseReport',
        name: 'Expense Report',
        icon: expenseReport
    },
    {
        id: '1',
        label: 'vehicleReport',
        name: 'Vehicle Report',
        icon: vechileReport
    },
    {
        id: '2',
        label: 'vehicleInsurance',
        name: 'Vehicle Insurance',
        icon: vechileInsurance
    },
    {
        id: '3',
        label: 'buildingInsurance',
        name: 'Building Insurance',
        icon: buidingInsurance
    },
    {
        id: '4',
        label: 'buildingMclTax',
        name: 'Building Mcl Tax',
        icon: buildingTax
    },
    {
        id: '5',
        label: 'documentFileStatus',
        name: 'Document File Status',
        icon: docStatus
    },
    { id: '6', label: 'toDoList', name: 'To Do List', icon: docStatus },
    { id: '7', label: 'requirement', name: 'Requirement', icon: docStatus },
    {
        id: '8',
        label: 'dispatchInstructions',
        name: 'Dispatch Instructions',
        icon: docStatus
    },
    {
        id: '9',
        label: 'salesManPerformance',
        name: 'Sales Man Performance',
        icon: docStatus
    }
];

export const formLabelMap: Record<string, string> = formTypes.reduce(
    (acc, { label, name }) => {
        acc[label] = name;
        return acc;
    },
    {} as Record<string, string>
);
