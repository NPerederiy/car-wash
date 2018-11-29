using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using CarWash.Models;

namespace CarWash.Services
{
    public class ScheduleServiceMock : IScheduleService
    {
        public IEnumerable<WashOption> GetWashOptions()
        {
            return new List<WashOption>
            {
                new WashOption
                {
                    OptionID = 1,
                    OptionDescription = "Basic wash",
                    Price = 5.2M,
                    Time = 12
                },
                new WashOption
                {
                    OptionID = 2,
                    OptionDescription = "Rug wash",
                    Price = 5.2M,
                    Time = 12
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
                    Time = 12
                },
            };
        }

        public IEnumerable<DateTime> GetAwailableDays(GetAwailableDaysRequest request)
        {
            if (request.WashOptions.Count() <= 0)
                throw new ArgumentException("At least one option should be specified");
            var days = new List<DateTime>();
            var now = DateTime.Now;
            if(request.WashOptions.Count() == 1)
            {
                for(var i = 0; i < 31; i++)
                {
                    days.Add(new DateTime(now.Year, now.Month, now.Day));
                }
            }
            else if(request.WashOptions.Count() < 3)
            {
                for (var i = 0; i < 31; i+= 2)
                {
                    days.Add(new DateTime(now.Year, now.Month, now.Day));
                }
            }
            else 
            {
                for (var i = 0; i < 31; i += 5)
                {
                    days.Add(new DateTime(now.Year, now.Month, now.Day));
                }
            }
            return days;
        }

        public IEnumerable<Schedule> GetSheduleForDay(GetScheduleForDayRequest request)
        {
            var shedules = new List<Schedule>();
            var startTime = new TimeSpan(9, 0, 0);
            var endTime = new TimeSpan(18, 0, 0);
            var random = new Random();
            for (var boxID = 0; boxID < 4; boxID++)
            {
                for(var time = startTime; time <= endTime; time = time += new TimeSpan(0, 15, 0))
                {
                    var nextValue = random.Next(5000);
                    var employeeID = random.Next(10);
                    var boxShedule = new Schedule
                    {
                        BoxID = boxID,
                        Date = request.Date,
                        Time = time,
                        OrderID = nextValue < 2400 ? nextValue : 0,
                        EmployeeID = employeeID
                    };
                    shedules.Add(boxShedule);
                }
            }
            return shedules;
        }

        public int CreateOrder(CreateOrderRequest request)
        {
            throw new NotImplementedException();
        }
    }
}
