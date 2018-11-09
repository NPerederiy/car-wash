using System;
using System.Collections.Generic;
using CarWash.Models;

namespace CarWash.Services
{
    public interface IScheduleService
    {
        IEnumerable<WashOption> GetWashOptions();

        IEnumerable<DateTime> GetAwailableDays(GetAwailableDaysRequest request);

        IEnumerable<BoxSchedule> GetSheduleForDay(GetScheduleForDayRequest request);
    }
}
