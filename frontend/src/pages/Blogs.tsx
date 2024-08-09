import { BlogCard } from "../components/BlogCard"
import { Appbar } from "../components/Appbar"
import { BlogSkeleton } from "../components/BlogSkeleton";
import { useBlogs } from "../hooks/index";



export const Blogs = ()=>{
    const { loading, blogs} = useBlogs();

    if (loading) {
        return <div>
            <Appbar /> 
            <div  className="flex justify-center">
                <div>
                    <BlogSkeleton />
                    <BlogSkeleton />
                    <BlogSkeleton />
                    <BlogSkeleton />
                    <BlogSkeleton />
                </div>
            </div>
        </div>
    }

    return <div>
        <Appbar />
        <div  className="flex justify-center">
            <div>
                {blogs.map((blog: { id: number; author: { name: any; }; title: string; content: string; }) => <BlogCard
                    id={blog.id}
                    authorName={blog.author.name || "Anonymous"}
                    title={blog.title}
                    content={blog.content}
                    PublishedDate={"2nd Feb 2024"}
                />)}
            </div>
        </div>
    </div>

}