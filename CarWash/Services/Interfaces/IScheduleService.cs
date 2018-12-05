using System;
using System.Collections.Generic;
using CarWash.Models;

namespace CarWash.Services
{
    public interface IScheduleService
    {
        IEnumerable<WashOption> GetWashOptions();

        IEnumerable<DateTime> GetAwailableDays(GetAwailableDaysRequest request);

        IEnumerable<Schedule> GetSheduleForDay(GetScheduleForDayRequest request);

        int CreateOrder(CreateOrderRequest request);
    }
}