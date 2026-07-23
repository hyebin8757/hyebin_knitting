
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://fuuowmiapdqrrkkytiux.supabase.co";
const supabaseKey = "sb_publishable_TmguTJ2on1AnBu2cE460JQ_Hhch2lbt";
const supabase = createClient(supabaseUrl, supabaseKey);

async function fetchDues() {
    const { data, error } = await supabase.from("dues").select("*");
    if (error) {
        console.error("Error:", error);
    } else {
        if (data && data.length > 0) {
            console.log("Dues keys:", Object.keys(data[0]));
            console.log("Dues example:", data[0]);
        }
    }
}

fetchDues();
