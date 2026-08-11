import { useState, useEffect } from 'react';
import { getFarms } from '../../api/farms';
import { useNavigate } from 'react-router-dom';
import { ChevronDown } from 'lucide-react';

export default function FarmSelector() {
    const [farms, setFarms] = useState([]);
    const [selected, setSelected] = useState(localStorage.getItem('selectedFarmId') || '');
    const navigate = useNavigate();

    useEffect(() => {
        getFarms()
            .then((res) => {
                const list = res.data.data.farms || [];
                setFarms(list);
                if (!selected && list.length > 0) {
                    setSelected(list[0]._id);
                    localStorage.setItem('selectedFarmId', list[0]._id);
                }
            })
            .catch(() => {});
    }, []);

    const handleChange = (e) => {
        const farmId = e.target.value;
        setSelected(farmId);
        localStorage.setItem('selectedFarmId', farmId);
        navigate(`/farms/${farmId}`);
    };

    if (farms.length === 0) return null;

    return (
        <div className="relative inline-block">
            <select
                value={selected}
                onChange={handleChange}
                className="appearance-none bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-1.5 pr-8 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
                {farms.map((farm) => (
                    <option key={farm._id} value={farm._id}>{farm.name}</option>
                ))}
            </select>
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
        </div>
    );
}