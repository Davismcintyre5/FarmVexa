import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getFarms } from '../../api/farms';
import { getFarmWeather, refreshWeather } from '../../api/weather';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Select from '../../components/ui/Select';
import Spinner from '../../components/ui/Spinner';
import EmptyState from '../../components/ui/EmptyState';
import { CloudSun, Thermometer, Droplets, Wind, Umbrella, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';

const weatherIcons = { sunny: '☀️', cloudy: '☁️', rainy: '🌧️', stormy: '⛈️', partly_cloudy: '⛅' };

export default function Weather() {
    const { user } = useAuth();
    const isFarmer = user?.role === 'farmer';

    const [farms, setFarms] = useState([]);
    const [farmId, setFarmId] = useState('');
    const [weather, setWeather] = useState(null);
    const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        if (!isFarmer && user?.farm) setFarmId(user.farm);
    }, [user]);

    useEffect(() => {
        if (isFarmer) getFarms().then((r) => setFarms(r.data.data.farms || []));
        else if (user?.farm) setFarms([{ _id: user.farm, name: 'Assigned Farm' }]);
    }, [isFarmer, user]);

    useEffect(() => {
        if (farmId) { setLoading(true); getFarmWeather(farmId).then((r) => setWeather(r.data.data.weather)).catch(() => setWeather(null)).finally(() => setLoading(false)); }
    }, [farmId]);

    const handleRefresh = async () => {
        setRefreshing(true);
        try { const r = await refreshWeather(farmId); setWeather(r.data.data.weather); toast.success('Weather refreshed'); }
        catch { toast.error('Failed to refresh'); }
        finally { setRefreshing(false); }
    };

    const icon = weatherIcons[weather?.condition] || '☀️';
    const forecast = weather?.forecast || [];

    if (loading) return <Spinner size="lg" className="mt-20" />;

    return (
        <div className="page-container space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Weather</h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">Farm weather & forecast</p>
                </div>
                <div className="flex items-center gap-3">
                    {isFarmer ? (
                        <Select value={farmId} onChange={(e) => setFarmId(e.target.value)} options={farms.map((f) => ({ value: f._id, label: f.name }))} className="w-48" />
                    ) : (
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">📍 {farms[0]?.name || 'Assigned Farm'}</p>
                    )}
                    {farmId && <Button onClick={handleRefresh} loading={refreshing} variant="outline"><RefreshCw className="w-4 h-4" /></Button>}
                </div>
            </div>

            {!farmId ? (
                <EmptyState icon={CloudSun} title="Select a farm" description={isFarmer ? 'Choose a farm to view weather.' : 'No farm assigned.'} />
            ) : !weather ? (
                <EmptyState icon={CloudSun} title="No weather data" description="Click refresh to fetch weather." actionLabel="Fetch Weather" onAction={handleRefresh} />
            ) : (
                <>
                    <Card>
                        <div className="text-center py-4">
                            <span className="text-6xl">{icon}</span>
                            <p className="text-4xl font-bold mt-2">{weather.temperature?.avg?.toFixed(1) || weather.temperature?.max || 'N/A'}°C</p>
                            <p className="text-lg text-gray-500 dark:text-gray-400 capitalize mt-1">{weather.condition?.replace('_', ' ')}</p>
                            <p className="text-xs text-gray-400 mt-1">Updated: {new Date(weather.updatedAt).toLocaleString('en-KE')}</p>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 pt-4 border-t">
                            <div className="text-center"><Thermometer className="w-5 h-5 text-red-500 mx-auto mb-1" /><p className="text-xs text-gray-500">Min / Max</p><p className="font-semibold">{weather.temperature?.min?.toFixed(1) || 'N/A'}° / {weather.temperature?.max?.toFixed(1) || 'N/A'}°</p></div>
                            <div className="text-center"><Droplets className="w-5 h-5 text-blue-500 mx-auto mb-1" /><p className="text-xs text-gray-500">Humidity</p><p className="font-semibold">{weather.humidity || 'N/A'}%</p></div>
                            <div className="text-center"><Umbrella className="w-5 h-5 text-blue-600 mx-auto mb-1" /><p className="text-xs text-gray-500">Rainfall</p><p className="font-semibold">{weather.rainfall || 0}mm</p></div>
                            <div className="text-center"><Wind className="w-5 h-5 text-gray-400 mx-auto mb-1" /><p className="text-xs text-gray-500">Wind</p><p className="font-semibold">{weather.windSpeed || 'N/A'} km/h</p></div>
                        </div>
                    </Card>

                    {forecast.length > 0 && (
                        <Card title="7-Day Forecast">
                            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
                                {forecast.map((f, i) => (
                                    <div key={i} className={`text-center p-3 rounded-xl ${i === 0 ? 'bg-primary-50 dark:bg-primary-900/20' : 'bg-gray-50 dark:bg-gray-800'}`}>
                                        <p className="text-xs font-medium text-gray-500">{i === 0 ? 'Today' : new Date(f.date).toLocaleDateString('en-KE', { weekday: 'short' })}</p>
                                        <p className="text-2xl my-1">{weatherIcons[f.condition] || '☀️'}</p>
                                        <p className="text-sm font-bold">{f.tempMax?.toFixed(0) || 'N/A'}°</p>
                                        <p className="text-xs text-gray-400">{f.tempMin?.toFixed(0) || 'N/A'}°</p>
                                        <div className="flex items-center justify-center gap-1 text-xs text-blue-500 mt-1"><Umbrella className="w-3 h-3" />{f.rainfall || 0}mm</div>
                                    </div>
                                ))}
                            </div>
                        </Card>
                    )}

                    {weather.alerts?.length > 0 && (
                        <Card title="⚠️ Weather Alerts">
                            {weather.alerts.map((a, i) => (
                                <div key={i} className={`p-3 rounded-lg mb-2 ${a.severity === 'high' ? 'bg-red-50 dark:bg-red-900/20 border border-red-200' : a.severity === 'medium' ? 'bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200' : 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200'}`}>
                                    <p className="font-medium text-sm">{a.message}</p>
                                    {a.recommendation && <p className="text-sm mt-1 opacity-80">{a.recommendation}</p>}
                                </div>
                            ))}
                        </Card>
                    )}

                    <Card title="💡 Farming Tips">
                        <div className="text-sm text-gray-600 dark:text-gray-400 space-y-2">
                            {weather.condition === 'sunny' && <p>☀️ Good day for spraying pesticides and harvesting.</p>}
                            {weather.condition === 'rainy' && <p>🌧️ Delay chemical application. Secure harvested crops.</p>}
                            {weather.temperature?.max > 30 && <p>🔥 Increase irrigation. Provide shade for poultry.</p>}
                            {weather.temperature?.min < 5 && <p>❄️ Protect young plants from frost.</p>}
                            {weather.windSpeed > 25 && <p>💨 Secure loose structures. Avoid spraying.</p>}
                        </div>
                    </Card>
                </>
            )}
        </div>
    );
}