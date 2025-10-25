"use server"

import { auth } from "@clerk/nextjs/server"
import { createSupabaseClient } from "../supabase";

export const createCompanion = async (formData: CreateCompanion) => {

    //auth() -> Obtiene el estado de sesión actual del usuario
    const { userId: author } = await auth();
    console.log(author)
    const supabase = createSupabaseClient()

    const { data, error } = await supabase
        .from('companions')
        .insert({ ...formData, author })
        .select() //retorna el registro recien creado después de la inserción.

    if(error || !data) throw new Error(error?.message || 'Failed to create a companion')

    return data[0]
}