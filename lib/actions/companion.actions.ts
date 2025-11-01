"use server"

import { auth } from "@clerk/nextjs/server"
import { createSupabaseClient } from "../supabase";

import { companionSchema, CreateCompanion, GetAllCompanions } from "../../types/index";
import { ValidationError } from "../utils";

export const createCompanion = async (formData: CreateCompanion) => {

    //auth() -> Obtiene el estado de sesión actual del usuario
    const { userId: author } = await auth();
    console.log(author)
    const supabase = createSupabaseClient()

    const { data, error } = await supabase
        .from('companions')
        .insert({ ...formData, author })
        .select() //retorna el registro recien creado después de la inserción.

    if (error || !data) throw new Error(error?.message || 'Failed to create a companion')

    return data[0]
}

export const getAllCompanions = async ({ limit = 10, page = 1, subject, topic }: GetAllCompanions) => {

    const supabase = createSupabaseClient()
    let query = supabase.from('companions').select()
    if (subject && topic) {
        //$topic$ = Realiza una búsqueda case insensitive
        query = query.ilike('subject', `%${subject}%`)
            .or(`topic.ilike.%${topic}%,name.ilike.%${topic}%`)
    }
    else if (subject) {
        query = query.ilike('subject', `%${subject}%`)
    }
    else if (topic) {
        query = query.or(`topic.ilike.%${topic}%,name.ilike.%${topic}%`)
    }

    query = query.range((page - 1) * limit, page * limit - 1)
    const { data: companions, error } = await query

    if (error) throw new Error(error.message)

    return companions
}

export const getCompanion = async (id: string) => {
    const supabase = createSupabaseClient()
    const { data, error } = await supabase
        .from('companions')
        .select('*')
        .eq('id', id)
        .single()

    if (error) return console.log(error)

    const validatedData = companionSchema.safeParse(data)
    if (!validatedData.success) {
        throw new ValidationError('Validation failed for companion data', validatedData.error.issues)
    }
    console.log(validatedData.data)

    return validatedData.data
}