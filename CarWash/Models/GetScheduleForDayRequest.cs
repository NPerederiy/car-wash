using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace CarWash.Models
{
    public class GetScheduleForDayRequest
    {
        private DateTime _date;
        public IEnumerable<int> WashOptionIDs { get; set; }
        public DateTime Date {
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
