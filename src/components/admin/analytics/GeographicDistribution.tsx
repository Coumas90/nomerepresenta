import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useCountryDistribution, useCityDistribution } from "@/hooks/useGeographicAnalytics";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

interface GeographicDistributionProps {
  startDate: Date;
  endDate: Date;
}

const COLORS = ['#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#3b82f6', '#6366f1', '#ef4444', '#14b8a6'];

const GeographicDistribution = ({ startDate, endDate }: GeographicDistributionProps) => {
  const { data: countries, isLoading: countriesLoading } = useCountryDistribution(startDate, endDate);
  const { data: cities, isLoading: citiesLoading } = useCityDistribution(startDate, endDate);

  if (countriesLoading || citiesLoading) {
    return (
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="col-span-2">
          <CardHeader>
            <Skeleton className="h-6 w-48" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-64" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!countries || countries.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Geographic Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">No geographic data available yet. Data will appear once visitors access your site.</p>
        </CardContent>
      </Card>
    );
  }

  const topCountries = countries.slice(0, 10);
  const pieData = countries.slice(0, 8).map(c => ({
    name: c.country_name,
    value: c.visitors,
  }));

  return (
    <div className="space-y-6">
      {/* Top Countries Table */}
      <Card>
        <CardHeader>
          <CardTitle>Top Countries</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Country</TableHead>
                <TableHead className="text-right">Visitors</TableHead>
                <TableHead className="text-right">Sessions</TableHead>
                <TableHead className="text-right">Avg Duration</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {topCountries.map((country) => (
                <TableRow key={country.country}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{country.country}</span>
                      {country.country_name}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">{country.visitors}</TableCell>
                  <TableCell className="text-right">{country.sessions}</TableCell>
                  <TableCell className="text-right">{country.avg_duration}s</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Bar Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Visitors by Country</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={topCountries} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="country_name" type="category" width={100} />
                <Tooltip />
                <Bar dataKey="visitors" fill="hsl(var(--primary))" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Visitor Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Top Cities */}
      {cities && cities.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Top Cities</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>City</TableHead>
                  <TableHead>Country</TableHead>
                  <TableHead className="text-right">Visitors</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {cities.map((city, idx) => (
                  <TableRow key={`${city.city}-${idx}`}>
                    <TableCell className="font-medium">{city.city}</TableCell>
                    <TableCell>{city.country_name}</TableCell>
                    <TableCell className="text-right">{city.visitors}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default GeographicDistribution;
