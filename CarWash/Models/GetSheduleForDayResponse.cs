using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace CarWash.Models
{
    public class GetSheduleForDayResponse
    {
        public IEnumerable<BoxShedule> BoxShedules { get; set; }
    }
}
