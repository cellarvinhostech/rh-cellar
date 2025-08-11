import type { EmployeeWithDetails } from "@/types/hr";

interface OrganizationChartProps {
  employees: EmployeeWithDetails[];
}

export function OrganizationChart({ employees }: OrganizationChartProps) {
  // Find CEO (no manager)
  const ceo = employees.find(emp => !emp.managerId);
  
  // Build hierarchy tree
  const buildHierarchy = (managerId?: string): EmployeeWithDetails[] => {
    return employees.filter(emp => emp.managerId === managerId);
  };

  const getEmployeesByDepartment = (departmentId: string) => {
    return employees.filter(emp => emp.departmentId === departmentId);
  };

  const departmentColors = {
    "dept-1": "bg-purple-100 border-purple-300", // Tech
    "dept-2": "bg-green-100 border-green-300",   // HR
    "dept-3": "bg-orange-100 border-orange-300", // Sales
    "dept-4": "bg-blue-100 border-blue-300"      // Marketing
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-8" data-testid="organization-chart">
      <div className="text-center">
        {/* CEO Level */}
        {ceo && (
          <div className="inline-block mb-8">
            <div className="bg-blue-100 border-2 border-blue-300 rounded-lg p-4">
              <div className="flex items-center space-x-3">
                <img 
                  src={ceo.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(ceo.name)}&background=e2e8f0&color=475569`}
                  alt={ceo.name}
                  className="w-12 h-12 rounded-full object-cover"
                  data-testid={`hierarchy-avatar-${ceo.id}`}
                />
                <div className="text-left">
                  <h3 
                    className="font-semibold text-slate-900"
                    data-testid={`hierarchy-name-${ceo.id}`}
                  >
                    {ceo.name}
                  </h3>
                  <p 
                    className="text-sm text-slate-600"
                    data-testid={`hierarchy-position-${ceo.id}`}
                  >
                    {ceo.position.title}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Department Managers Level */}
        <div className="flex justify-center space-x-8 flex-wrap gap-y-8">
          {buildHierarchy(ceo?.id).map((manager) => {
            const team = buildHierarchy(manager.id);
            const colorClass = departmentColors[manager.departmentId as keyof typeof departmentColors] || "bg-gray-100 border-gray-300";

            return (
              <div key={manager.id} className="text-center">
                {/* Connection line to CEO */}
                <div className="w-1 h-8 bg-slate-300 mx-auto"></div>
                
                {/* Manager Card */}
                <div className={`${colorClass} border-2 rounded-lg p-4`}>
                  <div className="flex items-center space-x-3">
                    <img 
                      src={manager.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(manager.name)}&background=e2e8f0&color=475569`}
                      alt={manager.name}
                      className="w-10 h-10 rounded-full object-cover"
                      data-testid={`hierarchy-avatar-${manager.id}`}
                    />
                    <div className="text-left">
                      <h4 
                        className="font-medium text-slate-900"
                        data-testid={`hierarchy-name-${manager.id}`}
                      >
                        {manager.name}
                      </h4>
                      <p 
                        className="text-xs text-slate-600"
                        data-testid={`hierarchy-position-${manager.id}`}
                      >
                        {manager.position.title}
                      </p>
                      <p 
                        className="text-xs text-slate-500"
                        data-testid={`hierarchy-department-${manager.id}`}
                      >
                        {manager.department.name}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Team Members */}
                {team.length > 0 && (
                  <div className="mt-6 space-y-3">
                    <div className="w-1 h-6 bg-slate-300 mx-auto"></div>
                    <div className="space-y-2">
                      {team.map((member) => (
                        <div 
                          key={member.id}
                          className="bg-slate-100 border border-slate-300 rounded p-2 text-xs"
                          data-testid={`team-member-${member.id}`}
                        >
                          <div className="flex items-center space-x-2">
                            <img 
                              src={member.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(member.name)}&background=e2e8f0&color=475569`}
                              alt={member.name}
                              className="w-6 h-6 rounded-full object-cover"
                            />
                            <div className="text-left">
                              <p className="font-medium">{member.name}</p>
                              <p className="text-slate-600">{member.position.title}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
