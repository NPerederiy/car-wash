using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace CarWash.Models
{
    public class GetWashOptionsResponse
    {
        public IEnumerable<WashOption> WashOptions { get; set; }
    }
}
