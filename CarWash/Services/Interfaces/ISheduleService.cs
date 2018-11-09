using System;
using System.Collections.Generic;
using CarWash.Models;

namespace CarWash.Services
{
    public interface ISheduleService
    {
        IEnumerable<WashOption> GetWashOptions();

        IEnumerable<DateTime> GetAwailableDays(GetAwailableDaysRequest request);

        IEnumerable<BoxShedule> GetSheduleForDay(GetSheduleForDayRequest request);
    }
}
