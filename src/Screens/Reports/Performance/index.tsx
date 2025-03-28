import { useCallback, useState } from 'react';
import { ulid } from 'ulid';
import { useSelector } from 'react-redux';
import { Loader, Input } from '@aws-amplify/ui-react';
import SelectSearch from 'react-select-search';
import { Schema } from '../../../../amplify/data/resource';
import UserListItems from '../../../components/UserList';
import useAuth from '../../../Hooks/useAuth';
import { usePagination } from '../../../Hooks/usePagination';
import PaginationControls from '../../../components/PaginationControls';
import Modal from '../../../components/Modal';
import { ModalButton, Heading } from '../../../style';
import { formatDateForInput } from '../../../utils/helpers';

const LIMIT = 10; // Number of items to display per page
const heading = 'Sales Man Performance';
const idField = 'formId';
type Form = Schema['Form']['type'];
const FORM_TYPE = 'salesManPerformance';

const SalesManPerformance = () => {
    const { userProfile, client } = useAuth();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState<any>({});
    const [isUpdateMode, setUpdateMode] = useState(false);

    const personsList = useSelector(
        (state: any) => state.globalReducer.persons
    );

    const itemsColumns = [
        {
            key: 'createdAt',
            header: 'Created At',
            render: (item: Form) => new Date(item.createdAt).toLocaleString()
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
            key: 'salesManPerformance_salesInRupees',
            header: 'Sales In Rupees'
        },
        {
            key: 'salesManPerformance_salesInKgs',
            header: 'Sales In Kgs'
        },
        {
            key: 'salesManPerformance_skus',
            header: 'SKUs',
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
            header: 'Avarage Expence Amount',
            render: (item: Form) =>
                ((item.salesManPerformance_salary +
                    item.salesManPerformance_expense) /
                    item.salesManPerformance_salesInRupees) *
                100
        },
        {
            key: 'salesManPerformance_avarage_Expence_Weight',
            header: 'Avarage Expence Wieght',
            render: (item: Form) => () => {
                const totalSales = item.salesManPerformance_skus.reduce(
                    (acc: number, curr: { sku: number; target: number }) =>
                        acc + curr.sku,
                    0
                );
                return (
                    (item.salesManPerformance_salary +
                        item.salesManPerformance_expense) /
                    totalSales
                );
            }
        }
    ];
};

export default SalesManPerformance;
