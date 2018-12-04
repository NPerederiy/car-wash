using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using CarWash.Models;

namespace CarWash.Services
{
    public interface IScheduleService
    {
        IEnumerable<WashOption> GetWashOptions();

        IEnumerable<DateTime> GetAwailableDays(GetAwailableDaysRequest request);

        IEnumerable<Schedule> GetSheduleForDay(GetScheduleForDayRequest request);

        Task<int> CreateOrder(CreateOrderRequest request);
    }
}
