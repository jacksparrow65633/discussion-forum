import React, { useState } from 'react'
import DashboardLayout from '../../components/layouts/DashboardLayout'
import MDEditor, { commands } from "@uiw/react-md-editor"
import {
  LuLoaderCircle,
  LuSave,
  LuSend,
  LuSparkles,
  LuTrash2,
} from "react-icons/lu"
import axiosInstance from '../../utils/axiosinstance'
import { API_PATHS } from '../../utils/apiPaths'
import { data, useNavigate, useParams } from 'react-router-dom'
import { useEffect } from 'react'
import CoverImageSelector from '../../components/Inputs/CoverImageSelector'
import TagInput from '../../components/Inputs/TagInput'
import SkeletonLoader from '../../components/Loader/SkeletonLoader'
import PostIdeaCard from '../../components/Cards/PostIdeaCard'
import Modal from "../../components/Modal"
import GeneratePostForm from './components/GeneratePostForm'
import uploadImage from "../../utils/uploadImage"
import toast from "react-hot-toast"
import { getToastMessagesByTypes } from '../../utils/helper'
import DeleteAlertContent from "../../components/DeleteAlertContent"

const BlogPostEditor = ({ isEdit }) => {

  const navigate = useNavigate()
  const { postSlug = "" } = useParams()

  const [postData, setPostData] = useState({
    id: "",
    title: "",
    content: "",
    coverImageUrl: "",
    coverPreview: "",
    tags: "",
    isDraft: "",
    generatedByAI: false
  })

  const [postIdeas, setPostIdeas] = useState([])
  
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const [openPostGenForm, setOpenPostGenForm] = useState({
    open: false,
    data: null,
  })
  const [ideaLoading, setIdeaLoading] = useState(false)

  const [openDeleteAlert, setOpenDeleteAlert] = useState(false)

  const handleValueChange = (key, value) => {
    setPostData((prevData) => ({ ...prevData, [key]: value }))
  }

  // Generate Post Ideas Using AI
  const generatePostIdeas = async () => {
    setIdeaLoading(true)
    try {
      const aiResponse = await axiosInstance.post(
        API_PATHS.AI.GENERATE_POST_IDEAS,
        {
          topics: "AI Tools, Online Earning, E-Commerce, Productivity, Digital Marketing"
        }
      )
      const generatedIdeas = aiResponse.data

      if (generatedIdeas?.length > 0)
        setPostIdeas(generatedIdeas)
    } catch (error) {
      console.log("Something went wrong. Please try again", error)
    } finally {
      setIdeaLoading(false)
    }
  }

  // Handle Post Publish
  const handlePublish = async (isDraft) => {
    let coverImageUrl = ""

    if (!postData.title.trim()) {
      setError("Please enter a title")
      return;
    }
    if (!postData.content.trim()) {
      setError("Please enter some content")
      return
    }

    if (!isDraft) {
      if (!isEdit && !postData.coverImageUrl) {
        setError("Please select a cover image")
        return
      }
      if (!isEdit && !postData.coverImageUrl && !postData.coverPreview) {
        setError("Please select a cover image")
        return
      }
      if (!postData.tags.length) {
        setError("Please add some tags")
        return
      }
    }

    setLoading(true)
    setError("")
    try {
      // Check if a new image was uploaded (File type)
      if (postData.coverImageUrl instanceof File) {
        const imgUploadRes = await uploadImage(postData.coverImageUrl)
        coverImageUrl = imgUploadRes.imageUrl || ""
      } else {
        coverImageUrl = postData.coverPreview
      }

      const reqPayload = {
        title: postData.title,
        content: postData.content,
        coverImageUrl,
        tags: postData.tags,
        isDraft: isDraft ? true : false,
        generatedByAI: true,
      }

      const response = isEdit
        ? await axiosInstance.put(
            API_PATHS.POSTS.UPDATE(postData.id),
            reqPayload
          )
        : await axiosInstance.post(API_PATHS.POSTS.CREATE, reqPayload)

      if (response.data) {
        toast.success(
          getToastMessagesByTypes(
            isDraft ? "draft" : isEdit ? "edit" : "published"
          )
        )
        navigate("/admin/posts")
      }
    } catch (error) {
      setError("Failed to publish post. Please tray again")
      console.error("Error publishing post", error)
    } finally {
      setLoading(false)
    }
  }

  // Get Post Data By Slug
  const fetchPostDetailsBySlug = async () => {
    try {
      const response = await axiosInstance.get(
        API_PATHS.POSTS.GET_BY_SLUG(postSlug)
      )

      if (response.data) {
        const data = response.data

        setPostData((prevData) => ({
          ...prevData,
          id: data._id,
          title: data.title,
          content: data.content,
          coverPreview: data.coverImageUrl,
          tags: data.tags,
          isDraft: data.isDraft,
          generatedByAI: data.generatedByAI
        }))
      }
    } catch (error) {
      console.error("Error:", error)
    }
  }

  // Delete Post
  const deletePost = async () => {
    try {
      await axiosInstance.delete(API_PATHS.POSTS.DELETE(postData.id))

      toast.success("Post Deleted Successfuly")
      setOpenDeleteAlert(false)
      navigate("/admin/posts")
    } catch (error) {
      console.error("Error deleting post:", error)
    }
  }

  useEffect(() => {
    if (isEdit) {
      fetchPostDetailsBySlug()
    } else {
      generatePostIdeas()
    }

    return () => {}
  }, [])

  return (
    <DashboardLayout activeMenu="Blog Posts">
      <div className="my-5">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-5 my-4">
          <div className="form-card p-6 col-span-12 md:col-span-8">
            <div className="flex items-center justify-between">
              <h2 className="text-base md:text-lg font-medium">
                {!isEdit ? "Add new Post" : "Edit Post"}
              </h2>

              <div className="flex items-center gap-3">
                {isEdit && (
                  <button
                    className="flex items-center gap-2.5 text-[13px] font-medium text-rose-500 bg-rose-50/60 rounded px-1.5 md:px-3 py-1 md:py-[3px] border border-rose-50 hover:border-rose-300 cursor-pointer hover:scale-[1.02] transition-all"
                    disabled={loading}
                    onClick={() => setOpenDeleteAlert(true)}
                  >
                    <LuTrash2 className="text-sm" />{" "}
                    <span className="hidden md:block">Delete</span>
                  </button>
                )}

                <button
                  className="flex items-center gap-2.5 text-[13px] font-medium text-sky-500 bg-sky-50/60 rounded px-1.5 md:px-3 py-1 md:py-[3px] border border-sky-100 hover:border-sky-400 cursor-pointer hover:scale-[1.02] transition-all"
                  disabled={loading}
                  onClick={() => handlePublish(true)}
                >
                  <LuSave className="text-sm" />{" "}
                  <span className="hidden md:block">Save as Draft</span>
                </button>

                <button
                  className="flex items-center gap-2.5 text-[13px] font-medium text-sky-600 hover:text-white hover:bg-linear-to-r hover:from-sky-500 hover:to-indigo-500 rounded px-3 py-[3px] border border-sky-500 hover:border-sky-50 cursor-pointer transition-all"
                  disabled={loading}
                  onClick={() => handlePublish(false)}
                >
                  {loading ? (
                    <LuLoaderCircle className="animate-spin text-[15px]" />
                  ) : (
                    <LuSend className="text-sm" />
                  )}{" "}
                  Publish
                </button>
              </div>
            </div>

            {error && <p className="text-red-500 text-xs pb-2.5">{error}</p>}

            <div className="mt-4">
              <label className="text-xs font-medium text-slate-600">
                Post Title
              </label>

              <input
                placeholder="Start sharing your ideas..."
                className="form-input"
                value={postData.title}
                onChange={({ target }) => 
                  handleValueChange("title", target.value)
                }
              />
            </div>

                <div className="mt-4">
                  <CoverImageSelector 
                    image={postData.coverImageUrl}
                    setImage={(value) => handleValueChange("coverImageUrl", value)}
                    preview={postData.coverPreview}
                    setPreview={(value) => handleValueChange("coverPreview", value)}
                  />
                </div>

                <div className="mt-3">
                  <label className="text-xs font-medium text-slate-600">
                    Content
                  </label>

                  <div data-color-mode="light" className="mt-3">
                    <MDEditor 
                      value={postData.content}
                      onChange={(data) => {
                        handleValueChange("content", data)
                      }}
                      commands={[
                        commands.bold,
                        commands.italic,
                        commands.strikethrough,
                        commands.hr,
                        commands.heading,
                        commands.divider,
                        commands.link,
                        commands.code,
                        commands.image,
                        commands.unorderedListCommand,
                        commands.unorderedListCommand,
                        commands.checkedListCommand,
                      ]}
                      hidemenu=""
                    />
                  </div>
                </div>

                <div className="mt-3">
                  <label className="text-xs font-medium text-slate-600">Tags</label>

                  <TagInput 
                    tags={postData?.tags || []}
                    setTags={(data) => {
                      handleValueChange("tags", data)
                    }}
                  />
                </div>
          </div>

          {!isEdit && (
            <div className="form-card col-span-12 md:col-span-4 p-0">
              <div className="flex items-center justify-between px-6 pt-6">
                <h4 className="text-sm md:text-base font-medium inline-flex items-center gap-2">
                  <span className="text-sky-600">
                    <LuSparkles />
                  </span>
                  Ideas for your next post
                </h4>

                <button 
                  className="bg-linear-to-r from-sky-500 to-cyan-400 text-[13px] font-semibold text-white px-3 py-1 rounded hover:bg-black hover:text-white transition-colors cursor-pointer hover:shadow-2xl hover:shadow-sky-200"
                  onClick={() => 
                    setOpenPostGenForm({ open: true, data: null })
                  }
                >
                  Generate New
                </button>
              </div>

              <div>
                {ideaLoading ? (
                  <div className="p-5">
                    <SkeletonLoader />
                  </div>
                ) : (
                  postIdeas.map((idea, index) => (
                    <PostIdeaCard
                      key={`idea_${index}`}
                      title={idea.title || ""}
                      description={idea.description || ""}
                      tags={idea.tags || []}
                      tone={idea.tone || "casual"}
                      onSelect={() =>
                        setOpenPostGenForm({ open: true, data: idea})
                      }
                    />
                  ))
                )}
              </div>
            </div>
          )}          
        </div>
      </div>
              <Modal
                isOpen={openPostGenForm?.open}
                onClose={() => {
                  setOpenPostGenForm({ open: false, data: null })
                }}
                hideHeader
              >
                <GeneratePostForm
                  contentParams={openPostGenForm?.data || null}
                  setPostContent={(title, content) => {
                    const postInfo = openPostGenForm?.data || null;
                    setPostData((prevState) => ({
                      ...prevState,
                      title: title || prevState.title,
                      content: content,
                      tags: postInfo?.tags || prevState.tags,
                      generatedByAI: true,
                    }))
                  }}
                  handleCloseForm={() => {
                    setOpenPostGenForm({ open: false, data: null })
                  }}
                />
              </Modal>

              <Modal
                isOpen={openDeleteAlert}
                onClose={() => {
                  setOpenDeleteAlert(false)
                }}
                title="Delete Alert"
              >
                <div className="w-[30vw]">
                  <DeleteAlertContent
                    content="Are you sure you want to delete this post?"
                    onDelete={() => deletePost()}
                  />
                </div>
              </Modal>
    </DashboardLayout>
  )
}

export default BlogPostEditor