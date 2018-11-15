using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace CarWash
{
    public static class Settings
    {
        public static string ConnectionString { get; } = @"Server=donutscarwashserver.database.windows.net;Initial Catalog=DonutsCarWash;Persist Security Info=False;User ID=donuts_admin;Password=--CarWash--;MultipleActiveResultSets=False;Encrypt=True;TrustServerCertificate=False;Connection Timeout=60;";
    }
}
