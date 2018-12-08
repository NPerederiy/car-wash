using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace CarWash
{
    public static class Settings
    {
        public static string ConnectionString { get; } = @"Server=tcp:carwashfit.database.windows.net,1433;Initial Catalog=CarWashBD;Persist Security Info=False;User ID=donuts@kobalmukr.onmicrosoft.com;Password=Yahu4031;MultipleActiveResultSets=False;Encrypt=True;TrustServerCertificate=False;Connection Timeout=30;";
    }
}
