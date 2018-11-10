using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace CarWash.Models
{
    public class GetScheduleForDayRequest
    {
        public IEnumerable<WashOption> WashOptions { get; set; }
        public DateTime Date { get; set; }
    }
}
