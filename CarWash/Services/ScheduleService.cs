using CarWash.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using Dapper;
using System.Threading.Tasks;

namespace CarWash.Services
{
    public class ScheduleService : IScheduleService
    {
        public ScheduleService()
        {
            UpdateDatabase();
        }

        public IEnumerable<WashOption> GetWashOptions()
        {
            return new List<WashOption>
            {
                new WashOption
                {
                    OptionID = 1,
                    OptionDescription = "Basic wash",
                    Price = 5.2M,
                    Time = 0.1
                },
                new WashOption
                {
                    OptionID = 2,
                    OptionDescription = "Rug wash",
                    Price = 5.2M,
                    Time = 0.5
                },
                new WashOption
                {
                    OptionID = 3,
                    OptionDescription = "Fully qualified washing",
                    Price = 11.4M,
                    Time = 1.1
                },
                new WashOption
                {
                    OptionID = 4,
                    OptionDescription = "Windows washing",
                    Price = 1.0M,
                    Time = 0.1
                },
            };
        }

        public IEnumerable<DateTime> GetAwailableDays(GetAwailableDaysRequest request)
        {
            if (request.WashOptions.Count() <= 0)
                throw new ArgumentException("At least one option should be specified");

            using(var context = Utilities.Sql())
            {
                var timeRequired = CalculateTime(request.WashOptions);

                var days = context.Query<DateTime>(@"
                SELECT 
	                [Date]
                FROM 
	                EmployeeSchedule
                WHERE
	                DATEDIFF(hour, FreeFrom, FreeTo) >= @requestedTime
                GROUP BY [Date]
                ORDER BY [Date]",
                param: new
                {
                    requestedTime = timeRequired
                });

                return days ?? new List<DateTime>();
            }
        }

        public IEnumerable<Schedule> GetSheduleForDay(GetScheduleForDayRequest request)
        {
            using(var context = Utilities.Sql())
            {
                var schedules = context.Query<Schedule>(@"
                SELECT 
	                b.BoxID
	                ,e.EmployeeID
	                ,b.[Date]
	                ,b.[Time]
	                ,b.OrderID
                FROM
	                BoxSchedule b
	                INNER JOIN EmployeeSchedule e
	                ON b.[Date] = e.[Date]
	                AND b.[Time] = e.[Time]
	                AND e.[Date] = @requestedDate",
                    param: new
                    {
                        requestedDate = request.Date
                    });

                return schedules;
            }
        }

        private void UpdateDatabase()
        {
            try
            {
                using (var context = Utilities.Sql())
                {
                    var employees = context.Query<Employee>(@"
                SELECT 
	                EmployeeID
                FROM 
	                Employees");

                    var lastDayEmployee = context.ExecuteScalar<DateTime>(@"
                SELECT TOP 1
                    [Date]
                FROM
                    EmployeeSchedule
                ORDER BY [Date] DESC
                ");

                    var lastDayBox = context.ExecuteScalar<DateTime>(@"
                SELECT TOP 1
                    [Date]
                FROM
                    EmployeeSchedule
                ORDER BY [Date] DESC
                ");

                    lastDayEmployee = lastDayEmployee == default(DateTime) ? DateTime.Now : lastDayEmployee;
                    lastDayBox = lastDayBox == default(DateTime) ? DateTime.Now : lastDayBox;
                    var lastDateMustBe = DateTime.Now.AddMonths(1).Date;
                    if (lastDayBox < lastDateMustBe || lastDayEmployee < lastDateMustBe)
                    {
                        var dateDifferenceEmployee = DateTime.Now.AddMonths(1) - lastDayEmployee;
                        var startFromDateEmployee = DateTime.Now.AddMonths(1).Subtract(dateDifferenceEmployee).AddDays(1);

                        var dateDifferenceBox = DateTime.Now.AddMonths(1) - lastDayBox;
                        var startFromDateBox = DateTime.Now.AddMonths(1).Subtract(dateDifferenceBox).AddDays(1);


                        List<string> boxesString = new List<string>();
                        boxesString.Add("");
                        int row = 0, counter = 0;
                        for (var i = 1; i <= 4; i++)
                        {
                            for (var date = startFromDateEmployee; date <= DateTime.Now.AddMonths(1); date = date.AddDays(1))
                            {
                                for (var time = new DateTime(2018, 11, 11, 9, 0, 0); time <= new DateTime(2018, 11, 11, 19, 0, 0); time = time.AddMinutes(15))
                                {
                                    if (counter++ == 999)
                                    {
                                        boxesString[row] = boxesString[row].Trim(',');
                                        row++;
                                        boxesString.Add("");
                                        counter = 0;
                                    }
                                    boxesString[row] += $"('{date.ToString("yyyy-MM-dd")}', '{time.ToString("HH:mm")}', '9:00', '18:00', {i}),";
                                }
                            }
                        }
                        boxesString[row] = boxesString[row].Trim(',');
                        List<string> employeeString = new List<string>();
                        employeeString.Add("");
                        row = counter = 0;
                        foreach (var employee in employees)
                        {
                            for (var date = startFromDateBox; date <= DateTime.Now.AddMonths(1); date = date.AddDays(1))
                            {
                                for (var time = new DateTime(2018, 11, 11, 9, 0, 0); time <= new DateTime(2018, 11, 11, 19, 0, 0); time = time.AddMinutes(15))
                                {
                                    if (counter++ == 999)
                                    {
                                        employeeString[row] = boxesString[row].Trim(',');
                                        row++;
                                        employeeString.Add("");
                                        counter = 0;
                                    }
                                    employeeString[row] += $"('{date.ToString("yyyy-MM-dd")}', '{time.ToString("HH:mm")}', '9:00', '18:00', {employee.EmployeeID}),";
                                }
                            }
                        }
                        employeeString[row] = employeeString[row].Trim(',');

                        foreach (var boxInsertion in boxesString)
                        {
                            var boxesScheduleCreated = context.ExecuteScalar<int>($@"
                    INSERT INTO BoxSchedule([Date],[Time], FreeFrom, FreeTo, BoxID) VALUES
                    {boxInsertion}");
                        }

                        foreach (var employeeInsertion in employeeString)
                        {
                            var employeesScheduleCreated = context.ExecuteScalar<int>($@"
                    INSERT INTO EmployeeSchedule([Date],[Time], FreeFrom, FreeTo, EmployeeID) VALUES
                    {employeeInsertion}");
                        }
                    }
                }
            }
            catch(Exception e)
            {
                var a = 6;
            }
        }

        private double CalculateTime(IEnumerable<WashOption> options)
        {
            return options.Sum(o => o.Time);
        }
    }
}
