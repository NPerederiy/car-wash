using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace CarWash.Models
{
    public class WashOption
    {
        public int OptionID { get; set; }
        public string OptionDescription { get; set; }
        public decimal Price { get; set; }
        public double Time { get; set; }
    }
}
