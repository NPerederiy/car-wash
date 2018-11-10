using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace CarWash.Models
{
    public class BoxSchedule
    {
        public int BoxID { get; set; }
        public int EmployeeID { get; set; }
        public int OrderID { get; set; }
        public DateTime Day { get; set; }
        public DateTime Time { get; set; }
    }
}
