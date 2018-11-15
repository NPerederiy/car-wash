using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.Data;
using System.Data.SqlClient;

namespace CarWash.Services
{
    public class Utilities
    {
        public static SqlConnection Sql()
        {
            return new SqlConnection(Settings.ConnectionString);
        }
    }
}
