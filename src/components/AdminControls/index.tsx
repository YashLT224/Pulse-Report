import { useState } from 'react';
import { useSelector } from 'react-redux';
import { useAuthenticator } from '@aws-amplify/ui-react';
import { Bar, Icon, Text, MenuItem } from './style.ts';
import FormSvg from '../../assets/form.svg';
import addUser from '../../assets/adduser.svg';
import Approval from '../../assets/approval.svg';
import List from '../../assets/list.svg';

const tiles = [
    { id: 0, name: 'Form Access', icon: FormSvg },
    { id: 1, name: 'Approval Requests', icon: Approval },
    { id: 2, name: 'Add User', icon: addUser },
    { id: 3, name: 'User List', icon: List }
];

const Tile = ({ data, isActive, onClick }) => {
    return (
        <MenuItem onClick={() => onClick(data.id)} active={isActive}>
            <Icon src={data.icon} alt={data.name} active={isActive} />
            <Text>{data.name}</Text>
        </MenuItem>
    );
};

const AdminControls = () => {
    const { user } = useAuthenticator();
    const userProfile = useSelector(
        (state: any) => state.authReducer.userProfile
    );
    const [activeItem, setActiveItem] = useState(tiles[0].id); // Default active item

    if (!user || !userProfile || userProfile.role !== 'admin') {
        return null;
    }

    return (
        <div>
            <Bar>
                {tiles.map(tile => (
                    <Tile
                        key={tile.id}
                        data={tile}
                        isActive={tile.id === activeItem}
                        onClick={setActiveItem}
                    />
                ))}
            </Bar>
        </div>
    );
};

export default AdminControls;
