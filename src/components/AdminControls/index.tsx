import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Bar, Icon, Text, MenuItem } from './style.ts';
import FormSvg from '../../assets/form.svg';
import addUser from '../../assets/adduser.svg';
import Approval from '../../assets/approval.svg';
import List from '../../assets/list.svg';

const tiles = [
    { id: 0, name: 'Form Access', link: '/', icon: FormSvg },
    {
        id: 1,
        name: 'Pending Approvals',
        link: '/pending-approvals',
        icon: Approval
    },
    { id: 2, name: 'User List', link: '/user-list', icon: List },
    { id: 3, name: 'Add User', link: '/add-user', icon: addUser }
];

const Tile = ({ data, isActive, onClick }) => {
    return (
        <MenuItem onClick={() => onClick(data.id, data.link)} active={isActive}>
            <Icon src={data.icon} alt={data.name} active={isActive} />
            <Text>{data.name}</Text>
        </MenuItem>
    );
};

const AdminControls = () => {
    const navigate = useNavigate();
    const location = useLocation();

    // Set initial active item based on the current URL
    const getInitialActiveItem = () => {
        const activeTile = tiles.find(tile => tile.link === location.pathname);
        return activeTile ? activeTile.id : tiles[0].id;
    };

    const [activeItem, setActiveItem] = useState(getInitialActiveItem); // Default active item

    const handleNavigation = (id: number, link: string) => {
        setActiveItem(id);
        navigate(link);
    };

    return (
        <div>
            <Bar>
                {tiles.map(tile => (
                    <Tile
                        key={tile.id}
                        data={tile}
                        isActive={tile.id === activeItem}
                        onClick={handleNavigation}
                    />
                ))}
            </Bar>
        </div>
    );
};

export default AdminControls;
