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
                    Time = 2
                },
                new WashOption
                {
                    OptionID = 2,
                    OptionDescription = "Rug wash",
                    Price = 5.2M,
                    Time = 7
                },
                new WashOption
                {
                    OptionID = 3,
                    OptionDescription = "Fully qualified washing",
                    Price = 11.4M,
                    Time = 12
                },
                new WashOption
                {
                    OptionID = 4,
                    OptionDescription = "Windows washing",
                    Price = 1.0M,
                    Time = 3
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
                SELECT DISTINCT
	                b.[Date]
                FROM 
	                EmployeeSchedule e
                INNER JOIN
                    BoxSchedule b
                    ON b.[Date] = e.[Date]
                        AND b.[Time] = e.[Time]
                GROUP BY 
                    b.[Date], b.FreeFrom, b.FreeTo, e.FreeFrom, e.FreeTo
                HAVING 
                    DATEDIFF(hour, b.FreeFrom, b.FreeTo) >= @requestedTime
                    AND DATEDIFF(hour, e.FreeFrom, e.FreeTo) >= @requestedTime
                ORDER BY 
                    [Date]",
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

        public int CreateOrder(CreateOrderRequest request)
        {
            var timeStart = request.TimeStart;
            var washOptions = GetWashOptions().Where(o => request.WashOptionIDs.Contains(o.OptionID));
            var timeEnd = GetEndTime(timeStart, washOptions);
            var availableEmployees = GetAvailableEmployees(request.Date, timeStart, timeEnd);
            if (!availableEmployees.Any())
                throw new ArgumentException("Invalid time frames. There are no available employees.");
            var employeeID = availableEmployees.First();

            using(var context = Utilities.Sql())
            {
                var orderID = context.ExecuteScalar<int>(@"
                EXEC dbo.CreateOrder @date, @startAt, @finishAt, @boxID, @employeeID, @orderID = @orderID OUTPUT

                SELECT @orderID
                ", new {
                    date = request.Date,
                    startAt = timeStart,
                    finishAt = timeEnd,
                    boxID = request.BoxID,
                    employeeID = employeeID
                });
                return orderID;
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

        private IEnumerable<int> GetAvailableEmployees(DateTime date, DateTime freeFrom, DateTime freeTo)
        {
            using(var context = Utilities.Sql())
            {
                var ids = context.Query<int>(@"
                SELECT DISTINCT
	                EmployeeID
                FROM
	                EmployeeSchedule
                WHERE
	                [Date] = @date
	                AND FreeFrom <= @freeFrom
	                AND FreeTo >= @freeTo",
                    new
                    {
                        date,
                        freeFrom,
                        freeTo
                    });
                return ids ?? new List<int>();
            }
        }

        private DateTime GetEndTime(DateTime startTime, IEnumerable<WashOption> washOptions)
        {
            using(var context = Utilities.Sql())
            {
                var rawEndTime = startTime.AddMinutes(CalculateTime(washOptions));

                var time = context.ExecuteScalar<DateTime>(@"
                SELECT TOP 1
                    [Time]
                FROM
                    EmployeeSchedule
                WHERE
                    [Time] >= @endTime
                ORDER BY
                    [Time]
                ",
                new
                {
                    endTime = rawEndTime
                });
                return time;
            }
        }

        private int CalculateTime(IEnumerable<WashOption> options)
        {
            return options.Sum(o => o.Time);
        }
    }
}
