using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace CarWash.Models
{
    public class GetScheduleForDayResponse
    {
        public IEnumerable<BoxSchedule> BoxShedules { get; set; }
    }
}
