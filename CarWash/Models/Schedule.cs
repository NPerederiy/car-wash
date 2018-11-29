using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace CarWash.Models
{
    public class Schedule
    {
        public int? ID { get; set; }
        public int? BoxID { get; set; }
        public int? EmployeeID { get; set; }
        public int? OrderID { get; set; }
        public DateTime Date { get; set; }
        public TimeSpan Time { get; set; }
    }
}
