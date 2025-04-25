import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import { Bar, Icon, Text, MenuItem } from './style.ts';
import addUser from '../../assets/adduser.svg';
import Approval from '../../assets/approval.svg';
import List from '../../assets/list.svg';
import { setActiveTile } from '../../Redux/slices/adminControlSlice.ts';

const tiles = [
    {
        id: 1,
        name: 'Pending Approvals',
        link: '/pending-approvals',
        icon: Approval
    },
    { id: 2, name: "Nikit's Chem Team", link: '/staff-members', icon: List },
    { id: 3, name: 'People', link: '/add-people', icon: addUser },
    { id: 4, name: ' Party', link: '/add-party', icon: addUser }
];

const Tile = ({ data, isActive, onClick }) => {
    return (
        <MenuItem
            onClick={() => onClick(data.id, data.link)}
            $active={isActive}
        >
            <Icon src={data.icon} alt={data.name} $active={isActive} />
            <Text>{data.name}</Text>
        </MenuItem>
    );
};

const AdminControls = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const location = useLocation();

    const activeTileId = useSelector(
        (state: any) => state.adminControlReducer.activeTileId
    );

    useEffect(() => {
        const activeTile = tiles.find(tile => tile.link === location.pathname);
        if (activeTile) {
            dispatch(setActiveTile(activeTile.id));
        }
    }, [location.pathname, dispatch]);

    const handleNavigation = (id: number, link: string) => {
        dispatch(setActiveTile(id));
        navigate(link);
    };

    return (
        <div>
            <Bar>
                {tiles.map(tile => (
                    <Tile
                        key={tile.id}
                        data={tile}
                        isActive={tile.id === activeTileId}
                        onClick={handleNavigation}
                    />
                ))}
            </Bar>
        </div>
    );
};

export default AdminControls;
