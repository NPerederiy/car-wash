using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace CarWash.Models
{
    public class GetScheduleForDayRequest
    {
        private DateTimeOffset _date;

        public IEnumerable<WashOption> WashOptions { get; set; }
        public DateTimeOffset Date {
            get
            {
                return _date.Date;
            }
            set
            {
                _date = value;
            }
        }
    }
}
