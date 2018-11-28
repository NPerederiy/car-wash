﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace CarWash.Models
{
    public class CreateOrderRequest
    {
        public IEnumerable<int> WashOptionIDs { get; set; }
        public int BoxID { get; set; }
        public DateTime Date { get; set; }
        public DateTime TimeStart { get; set; }
    }
}
