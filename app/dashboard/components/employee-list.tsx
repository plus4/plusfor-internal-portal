'use client';

import { useEffect, useState } from 'react';
import { Employee } from '@/lib/types';
import { useInView } from 'react-intersection-observer';

type EmployeeListProps = {
  initialEmployees: Employee[];
  hasMore: boolean;
};

export function EmployeeList({ initialEmployees, hasMore: initialHasMore }: EmployeeListProps) {
  const [employees, setEmployees] = useState<Employee[]>(initialEmployees);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [isLoading, setIsLoading] = useState(false);
  const { ref, inView } = useInView();

  useEffect(() => {
    const loadMore = async () => {
      if (inView && hasMore && !isLoading) {
        setIsLoading(true);
        try {
          const response = await fetch(`/api/employees?page=${page + 1}`);
          const { data, hasMore: newHasMore } = await response.json();
          setEmployees(prev => [...prev, ...data]);
          setHasMore(newHasMore);
          setPage(prev => prev + 1);
        } catch (error) {
          console.error('Error loading more employees:', error);
        } finally {
          setIsLoading(false);
        }
      }
    };

    loadMore();
  }, [inView, hasMore, isLoading, page]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {employees.map((employee) => (
        <div
          key={employee.id}
          className="bg-card rounded-lg border border-border p-6 hover:border-primary/50 transition-colors"
        >
          <div className="flex flex-col space-y-4">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-lg font-medium text-primary">
                  {employee.name.charAt(0)}
                </span>
              </div>
              <div>
                <h3 className="font-semibold">{employee.name}</h3>
                <p className="text-sm text-muted-foreground">{employee.position}</p>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center text-sm">
                <span className="w-20 text-muted-foreground">部署</span>
                <span>{employee.department}</span>
              </div>
              <div className="flex items-center text-sm">
                <span className="w-20 text-muted-foreground">メール</span>
                <span className="truncate">{employee.email}</span>
              </div>
            </div>
          </div>
        </div>
      ))}
      {hasMore && (
        <div ref={ref} className="col-span-full flex justify-center py-4">
          {isLoading && (
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          )}
        </div>
      )}
    </div>
  );
} 